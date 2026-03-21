//+------------------------------------------------------------------+
//|                        FATH ROBOT V1.6                           |
//|                    Gann AI Trading System                        |
//|                  Copyright 2024-2025, FATH AI                    |
//+------------------------------------------------------------------+
#property copyright   "FATH AI Trading System"
#property link        "https://t.me/Fath_EA"
#property version     "1.6"
#property description "══════════════════════════════════════════"
#property description "         🤖 FATH ROBOT V1.6"
#property description "      Gann Square Trading System"
#property description "══════════════════════════════════════════"
#property description ""
#property description "📢 Telegram Kanal: https://t.me/Fath_EA"
#property description "👨‍💻 Muallif: https://t.me/TraderMQL"
#property description "📞 Telefon: +998930012284"
#property description ""
#property description "══════════════════════════════════════════"
#property description "⚠️ RISK OGOHLANTIRISHLARI:"
#property description "══════════════════════════════════════════"
#property description "• Forex va CFD savdosi yuqori riskli."
#property description "• Sarmoyangizni yo'qotish ehtimoli bor."
#property description "• Faqat yo'qotishga tayyor mablag' bilan savdo qiling."
#property description "• O'tmishdagi natijalar kelajakni kafolatlamaydi."
#property description "• Robot faqat yordamchi vosita, mas'uliyat sizdа."
#property description ""
#property description "✅ Savdo qilishdan oldin demo hisobda sinab ko'ring!"
#property strict

#include <Trade\Trade.mqh>
#include <Trade\SymbolInfo.mqh>
#include <Trade\PositionInfo.mqh>

//+------------------------------------------------------------------+
//|                    FATH ROBOT V1.6 SOZLAMALARI                   |
//+------------------------------------------------------------------+

//===================================================================
//                     1. ASOSIY SOZLAMALAR
//===================================================================
input string   inp_sep2 = "══════════════════════════════";  // ══════ ASOSIY ══════
input int      MagicNumber = 123456;                          // 🎯 Magic Number
input double   Lots = 0.01;                                   // 💰 Boshlang'ich Lot
input double   Maxlot = 0.30;                                 // 💰 Maksimal Lot

//===================================================================
//                   2. GANN SQUARE SOZLAMALARI
//===================================================================
input string   inp_sep3 = "══════════════════════════════";  // ══════ GANN SQUARE ══════
input bool     IsManualCenter = true;                         // 📊 Qo'lda CenterPrice (true=Ha/false=Avto)
input int      CenterPrice = 3025;                            // 📍 Markaziy Narx (qo'lda kiritish)
input int      MaxStrongLimit = 5000;                         // 📈 Strong Levels Limiti

//===================================================================
//                    3. SAVDO SOZLAMALARI
//===================================================================
input string   inp_sep4 = "══════════════════════════════";  // ══════ SAVDO ══════

enum TPtype { AVTO, MANUAL, PIVOT };
enum RECOVERY { ON, OFF };

input RECOVERY Recovery_Mode = ON;                            // 🔄 Recovery Mode (ON/OFF)
input TPtype   Teyktype = AVTO;                               // 🎯 TP Turi (AVTO/MANUAL/PIVOT)
input double   TP1 = 500;                                     // ✅ Take Profit 1 (points)
input double   TP2 = 1000;                                    // ✅ Take Profit 2 (points)
input double   BU = 200;                                      // 🔒 Breakeven (points)
int    MaxPositionsPerSymbol = 2;

//===================================================================
//                   4. SAVDO KUNLARI
//===================================================================
input string   inp_sep5 = "══════════════════════════════";  // ══════ SAVDO KUNLARI ══════
input bool     TradingOnMonday = true;                        // 📅 Dushanba
input bool     TradingOnTuesday = true;                       // 📅 Seshanba
input bool     TradingOnWednesday = true;                     // 📅 Chorshanba
input bool     TradingOnThursday = true;                      // 📅 Payshanba
input bool     TradingOnFriday = true;                        // 📅 Juma

//===================================================================
//                    5. TELEGRAM SOZLAMALARI
//===================================================================
input string   inp_sep6 = "══════════════════════════════";  // ══════ TELEGRAM ══════
input bool     SendTelegramSignals = true;                    // 📱 Signal Yuborish (ON/OFF)
input string   TelegramBotToken = "8161852003:AAFwAP8fLiAsaMJyQQJj62dKPwDCm_QgfVQ";  // 🤖 Bot Token
input string   TelegramChatID = "-1002934293554";             // 💬 Chat/Channel ID

//===================================================================
//                  6. SAYTGA STATISTIKA YUBORISH
//===================================================================
input string   inp_sep7 = "══════════════════════════════";  // ══════ SAYT SYNC ══════
input bool     EnableSiteTradeSync = true;                    // 🌐 Bitimlarni saytga yuborish
input bool     RequireLicenseValidation = true;               // 🔒 Tekshiruv bo'lmasa EA ishlamasin
input string   SiteApiBaseUrl = "https://fathrobot--fathrobot-5c48d.us-central1.hosted.app"; // 🌍 API bazasi
input string   SiteApiFallbackUrl = "https://fathrobot-5c48d.web.app"; // ↩️ Zaxira URL
input string   SiteLicenseKey = "";                           // 🔑 Kabinetdagi litsenziya kaliti
input string   SiteApiSecret = "";                            // 🛡️ x-ea-secret (ixtiyoriy)
input bool     SiteSyncDebugLog = false;                      // 🧪 Batafsil log

//===================================================================
//                     ICHKI O'ZGARUVCHILAR
//===================================================================
CTrade        a_trade;
CSymbolInfo   a_symbol;
CPositionInfo a_position;
double CurrentLot;
double yesterday_close;
double sell_entry, buy_entry;
double sell_tp1, sell_tp2;
double buy_tp1, buy_tp2;


int BuyTradesToday = 0;
int SellTradesToday = 0;
datetime LastDay = 0;

// Yangi mantiq uchun o'zgaruvchilar
bool buySignalUsed = false;      // Buy signal ishlatilganmi
bool sellSignalUsed = false;     // Sell signal ishlatilganmi
bool buyCanTrade = true;         // Buy ochish mumkinmi
bool sellCanTrade = true;        // Sell ochish mumkinmi

// ============= TELEGRAM UCHUN O'ZGARUVCHILAR =============
datetime lastDailyReportTime = 0;        // Oxirgi kunlik hisobot vaqti
double dailyProfit = 0;                   // Kunlik foyda
int dailyTrades = 0;                      // Kunlik bitimlar soni
int dailyWins = 0;                        // Kunlik yutilgan bitimlar
int dailyLosses = 0;                      // Kunlik yo'qotilgan bitimlar
ulong lastProcessedTicket = 0;            // Oxirgi qayta ishlangan ticket
ulong lastSyncedTradeTicket = 0;          // Saytga yuborilgan oxirgi ticket
bool breakevenNotified[];                 // Breakeven xabari yuborilganmi
ulong breakevenTickets[];                 // Breakeven tickets

// ============= LITSENZIYA HOLATI =============
bool g_licenseValid = false;              // Litsenziya tekshiruvi muvaffaqiyatlimi
string g_licenseExpiry = "";             // Amal muddati (ISO string)
datetime g_lastHeartbeat = 0;            // Oxirgi heartbeat vaqti
const int HEARTBEAT_INTERVAL_SEC = 1800; // Heartbeat oralig'i: 30 daqiqa
string g_licenseBlockReason = "";        // Qat'iy rad sababi
int g_heartbeatFailCount = 0;            // Ketma-ket heartbeat xatoliklari
const int MAX_HEARTBEAT_FAILS = 3;       // Maks ketma-ket xatolik (bunda trading bloklanadi)

// ============= EMOJI FUNKSIYASI =============
string Emoji(int codepoint)
{
   // Surrogate pair yaratish (emojilar uchun)
   if(codepoint >= 0x10000)
   {
      int high = ((codepoint - 0x10000) >> 10) + 0xD800;
      int low = ((codepoint - 0x10000) & 0x3FF) + 0xDC00;
      return ShortToString((ushort)high) + ShortToString((ushort)low);
   }
   return ShortToString((ushort)codepoint);
}

struct LevelInfo {
   double lower;
   double upper;
   double nearest;
   double difference;
   double sell_entry;
   double buy_entry;
   double sell_tp1;
   double sell_tp2;
   double buy_tp1;
   double buy_tp2;
};

//======================= Avtomatik CenterPrice hisoblash =======================
int CalculateAutoCenterPrice(double current_price)
{
   // Narxni butun songa aylantirish (Forex juftliklar uchun multiplier)
   double price_adjusted = current_price;
   
   // Agar narx juda kichik bo'lsa (EURUSD, GBPUSD kabi) - 10000 ga ko'paytirish
   if(current_price < 100)
      price_adjusted = current_price * 10000;
   
   int price_int = (int)MathRound(price_adjusted);
   
   // Eng yaqin mukammal kvadratni topish
   int sqrt_price = (int)MathSqrt((double)price_int);
   
   // Ikki yaqin kvadratdan birini tanlash
   int lower_square = sqrt_price * sqrt_price;
   int upper_square = (sqrt_price + 1) * (sqrt_price + 1);
   
   // Qaysi biri yaqinroq?
   if(MathAbs(price_int - lower_square) < MathAbs(price_int - upper_square))
      return lower_square;
   else
      return upper_square;
}

// Joriy symbol uchun CenterPrice olish
int GetCenterPriceForSymbol()
{
   // Agar IsManualCenter = true bo'lsa - foydalanuvchi kiritgan CenterPrice
   // Bu oltin (XAUUSD, GOLD, XAU) yoki boshqa har qanday instrument uchun ishlatiladi
   if(IsManualCenter)
      return CenterPrice;
   
   // IsManualCenter = false bo'lsa - avtomatik hisoblash
   // EURUSD, GBPUSD, BTCUSD va boshqalar uchun
   double current_price = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   return CalculateAutoCenterPrice(current_price);
}

//======================= Gann kvadrati va kuchli darajalar =======================
void GenerateGannSquare(int center, int max_value, int &values[], double &x_coords[], double &y_coords[]) {
   int x=0, y=0;
   int dx=0, dy=-1;
   int idx=0;

   ArrayResize(values, max_value-center+1);
   ArrayResize(x_coords, max_value-center+1);
   ArrayResize(y_coords, max_value-center+1);

   for(int n=center; n<=max_value; n++) {
      values[idx]   = n;
      x_coords[idx] = x;
      y_coords[idx] = y;

      if ((x == y) || (x < 0 && x == -y) || (x > 0 && x == 1-y)) {
         int tmp = dx;
         dx = -dy;
         dy = tmp;
      }
      x += dx;
      y += dy;
      idx++;
   }
}

void GetStrongLevels(int center_price, int limit, double &strong_levels[])
{
   ArrayResize(strong_levels, 0);
   
   // OLTIN va kichik center uchun - ORIGINAL Gann Square spiral uslubi
   // Boshqa instrumentlar uchun - soddalashtirilgan formula
   
   if(IsManualCenter && center_price < 10000) {
      // ===== ORIGINAL GANN SQUARE USLUBI (OLTIN UCHUN) =====
      int values[];
      double x_coords[], y_coords[];
      GenerateGannSquare(center_price, center_price + limit, values, x_coords, y_coords);
      
      double strong_angles[8] = {0, 45, 90, 135, 180, 225, 270, 315};
      
      for(int i = 0; i < ArraySize(values); i++) {
         double angle = MathMod(MathArctan2(y_coords[i], x_coords[i]) * 180.0 / M_PI + 360.0, 360.0);
         for(int j = 0; j < 8; j++) {
            // Tolerance ni biroz kengaytirdik (1e-6 dan 0.01 ga)
            if(MathAbs(angle - strong_angles[j]) < 0.01) {
               int new_size = ArraySize(strong_levels) + 1;
               ArrayResize(strong_levels, new_size);
               strong_levels[new_size - 1] = values[i];
               break;
            }
         }
      }
   }
   else {
      // ===== SODDALASHTIRILGAN FORMULA (FOREX, CRYPTO UCHUN) =====
      double sqrt_center = MathSqrt((double)center_price);
      double step;
      
      if(center_price > 50000) {
         // BTCUSD - 1.5x kattaroq step
         step = sqrt_center * 1.5;  // ~438 BTCUSD uchun
      }
      else if(center_price > 5000) {
         // EURUSD, GBPUSD - 3x kichikroq step
         step = sqrt_center / 12.0;  // ~9 EURUSD uchun
      }
      else {
         // O'rta narxli
         step = sqrt_center / 2.0;
      }
      
      int max_levels = 100;
      for(int n = -max_levels; n <= max_levels; n++) {
         double level = center_price + (n * step);
         if(level > 0) {
            int new_size = ArraySize(strong_levels) + 1;
            ArrayResize(strong_levels, new_size);
            strong_levels[new_size - 1] = MathRound(level);
         }
      }
   }
   
   ArraySort(strong_levels);
}

//======================= Trade zones hisoblash =======================
LevelInfo TradeZones(int center_price, double input_price) {
   LevelInfo result;
   double strong_levels[];
   
   // Multiplier aniqlash - kichik narxlar uchun
   double multiplier = 1.0;
   if(input_price < 100) {
      multiplier = 10000.0;  // Forex juftliklar uchun
   }
   
   // Narxni multiplier bilan ko'paytirish
   double adjusted_price = input_price * multiplier;
   
   GetStrongLevels(center_price, MaxStrongLimit, strong_levels);

   double lower = -1, upper = -1;
   for(int i = 0; i < ArraySize(strong_levels); i++) {
      if(strong_levels[i] <= adjusted_price)
         lower = strong_levels[i];
      if(strong_levels[i] >= adjusted_price) {
         upper = strong_levels[i];
         break;
      }
   }

   if(lower < 0 || upper < 0) {
      result.lower = -1;
      result.upper = -1;
      return result;
   }

   double diff_lower = MathAbs(adjusted_price - lower);
   double diff_upper = MathAbs(upper - adjusted_price);

   double diff;
   double nearest;
   if(diff_lower <= diff_upper) {
      diff = diff_lower;
      nearest = lower;
   } else {
      diff = diff_upper;
      nearest = upper;
   }

   // Natijalarni multiplier ga bo'lib qaytarish
   result.lower      = lower / multiplier;
   result.upper      = upper / multiplier;
   result.nearest    = nearest / multiplier;
   result.difference = diff / multiplier;

   // Asosiy hisob
   result.sell_entry = (lower - diff) / multiplier;
   result.buy_entry  = (upper + diff) / multiplier;

   // Qo'shimcha shart: agar diff juda kichik bo'lsa
   if(diff < 1) {
      result.sell_entry = input_price - (5 / multiplier);
      result.buy_entry  = input_price + (5 / multiplier);
   }

   // --- TP hisoblash ---
   int lower_index = -1, upper_index = -1;
   for(int i = 0; i < ArraySize(strong_levels); i++) {
      if(strong_levels[i] == lower) lower_index = i;
      if(strong_levels[i] == upper) upper_index = i;
   }
  
   // --- SELL TP
   if(lower_index > 2) {  
      result.sell_tp1 = strong_levels[lower_index - 2] / multiplier;
      result.sell_tp2 = strong_levels[lower_index - 3] / multiplier;
   } else if(lower_index == 2) {
      result.sell_tp1 = strong_levels[lower_index - 1] / multiplier;
      result.sell_tp2 = strong_levels[lower_index - 2] / multiplier;
   } else if(lower_index == 1) {
      result.sell_tp1 = strong_levels[lower_index - 1] / multiplier;
      result.sell_tp2 = result.sell_tp1 - (diff * 2 / multiplier);
   } else {
      result.sell_tp1 = result.sell_entry - (diff * 2 / multiplier);
      result.sell_tp2 = result.sell_entry - (diff * 4 / multiplier);
   }

   // --- BUY TP
   if(upper_index < ArraySize(strong_levels) - 3) {  
      result.buy_tp1 = strong_levels[upper_index + 2] / multiplier;
      result.buy_tp2 = strong_levels[upper_index + 3] / multiplier;
   } else if(upper_index == ArraySize(strong_levels) - 3) {
      result.buy_tp1 = strong_levels[upper_index + 1] / multiplier;
      result.buy_tp2 = strong_levels[upper_index + 2] / multiplier;
   } else if(upper_index == ArraySize(strong_levels) - 2) {
      result.buy_tp1 = strong_levels[upper_index + 1] / multiplier;
      result.buy_tp2 = result.buy_tp1 + (diff * 2 / multiplier);
   } else {
      result.buy_tp1 = result.buy_entry + (diff * 2 / multiplier);
      result.buy_tp2 = result.buy_entry + (diff * 4 / multiplier);
   }

   return result;
}





//======================= Siz bergan savdo funksiyalari =======================
// Buy pozitsiyani Take Profit bilan ochuvchi funksiya
bool OpenBuyWithTP(double alot, double sl, double tp)
  {
   if(alot == 0)
     {
      Print("Buy order ochishda xatolik: lot 0");
      return (false);
     }

   if(a_trade.Buy(alot, a_symbol.Name(), a_symbol.Ask(), 0, tp))
     {
      if(a_trade.ResultDeal() == 0)
        {
         Print("Buy order ochishda xatolik: result deal 0");
         return (false);
        }
     }
   return (true);
  }

// Sell pozitsiyani Take Profit bilan ochuvchi funksiya
bool OpenSellWithTP(double alot, double sl, double tp)
  {
   if(alot == 0)
     {
      Print("Sell order ochishda xatolik: lot 0");
      return (false);
     }

   if(a_trade.Sell(alot, a_symbol.Name(), a_symbol.Bid(), 0, tp))
     {
      if(a_trade.ResultDeal() == 0)
        {
         Print("Sell order ochishda xatolik: result deal 0");
         return (false);
        }
     }
   return (true);
  }

// Symbol va Magic Number bo'yicha ochilgan pozitsiyalar sonini hisoblovchi
int PositionsCountForSymbol(string symbol_name)
  {
   int cnt = 0;
   for(int i = 0; i < PositionsTotal(); i++)
     {
      if(a_position.SelectByIndex(i))
        {
         if(a_position.Symbol() == symbol_name && a_position.Magic() == MagicNumber)
            cnt++;
        }
     }
   return cnt;
  }

// Pozitsiya biznikimi tekshirish (Symbol + Magic)
bool IsOurPosition(ulong ticket)
{
   if(!PositionSelectByTicket(ticket))
      return false;
   if(PositionGetString(POSITION_SYMBOL) != _Symbol)
      return false;
   if(PositionGetInteger(POSITION_MAGIC) != MagicNumber)
      return false;
   return true;
}

//======================= OnInit va OnTick =======================
int OnInit()
{
   // Symbol ma'lumotlarini yangilash
   if(!a_symbol.Name(Symbol()))
     a_symbol.Refresh();
    CurrentLot = Lots;
   
   // Magic Number o'rnatish - har bir chart uchun alohida
   a_trade.SetExpertMagicNumber(MagicNumber);

   // Litsenziya tekshiruvi
   if(EnableSiteTradeSync)
   {
      if(RequireLicenseValidation && StringLen(SiteLicenseKey) < 8)
      {
         Print("FATH ROBOT: SiteLicenseKey bo'sh. EA to'xtatildi.");
         return INIT_FAILED;
      }

      g_licenseValid = CheckLicenseOnServer();
      if(!g_licenseValid)
      {
         if(RequireLicenseValidation)
         {
            Print("FATH ROBOT: Litsenziya tekshiruvi muvaffaqiyatsiz (", g_licenseBlockReason, "). EA to'xtatildi.");
            return INIT_FAILED;
         }
         Print("FATH ROBOT ogoh.: Litsenziya tekshiruvi o'tkazilmadi (", g_licenseBlockReason, "). Savdo ishlaydi.");
      }
      g_lastHeartbeat = TimeCurrent();
   }

   // Telegram test xabari yuborish
   if(SendTelegramSignals && StringLen(TelegramBotToken) > 10 && StringLen(TelegramChatID) > 1)
   {
      string e_robot = Emoji(0x1F916);    // 🤖
      string e_check = Emoji(0x2705);     // ✅
      string e_chart = Emoji(0x1F4CA);    // 📊
      string e_clock = Emoji(0x23F0);     // ⏰
      
      string testMsg = e_robot + " FATH ROBOT v1.6\n" +
                       "====================\n\n" +
                       e_check + " Robot muvaffaqiyatli ishga tushdi!\n\n" +
                       e_chart + " Symbol: " + _Symbol + "\n" +
                       e_clock + " Vaqt: " + TimeToString(TimeCurrent(), TIME_DATE|TIME_SECONDS);
      SendTelegramMessage(testMsg);
   }

   return INIT_SUCCEEDED;
}



















void OnTick()
{
double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double profit  = AccountInfoDouble(ACCOUNT_PROFIT);
   string status  = "Active";
   string signal  = "Kutish ?";
   int total = PositionsTotal();

   // ============= HEARTBEAT VA LITSENZIYA TEKSHIRUVI (BIRINCHI!) =============
   // Bu savdo kuni tekshiruvidan OLDIN bo'lishi shart —
   // dam olish kunlarida ham litsenziya bekor qilinsa EA to'xtashi kerak
   if(EnableSiteTradeSync && StringLen(SiteLicenseKey) >= 8)
   {
      if(TimeCurrent() - g_lastHeartbeat >= HEARTBEAT_INTERVAL_SEC)
      {
         bool hb = SendHeartbeatToServer();
         if(!hb)
         {
            g_heartbeatFailCount++;
            g_lastHeartbeat = TimeCurrent() - HEARTBEAT_INTERVAL_SEC + 300;
            if(g_heartbeatFailCount >= MAX_HEARTBEAT_FAILS)
            {
               g_licenseValid = false;
               Print("FATH ROBOT: ", MAX_HEARTBEAT_FAILS, " ta ketma-ket heartbeat xatosi. EA bloklanmoqda.");
               ExpertRemove();
               return;
            }
            else
            {
               Print("FATH ROBOT: Heartbeat muvaffaqiyatsiz (", g_heartbeatFailCount, "/", MAX_HEARTBEAT_FAILS, "), 5 daqiqadan keyin qayta uriniladi.");
            }
         }
         else
         {
            g_heartbeatFailCount = 0;
            g_lastHeartbeat = TimeCurrent();
         }
      }
   }

   // Litsenziya yaroqsiz bo'lsa EA ni grafikdan olib tashlash
   if(EnableSiteTradeSync && RequireLicenseValidation && !g_licenseValid)
   {
      status = "Litsenziya yaroqsiz";
      ShowFathPanel(status, balance, profit, signal, "1.6", "BLOCKED");
      ExpertRemove();
      return;
   }

 if(!IsTradingAllowedToday())
   {
      status = "Savdo kuni emas";
      ShowFathPanel(status, balance, profit, signal, "2.0", "Normal");
      return;
   }

// Yangi kunni tekshirish
datetime todayStart = iTime(_Symbol, PERIOD_D1, 0);
if(todayStart != LastDay)
{
   // yangi kun boshlandi -> reset hisoblagichlar
   BuyTradesToday = 0;
   SellTradesToday = 0;
   LastDay = todayStart;
   
   // Yangi kun - signallarni reset qilish
   buySignalUsed = false;
   sellSignalUsed = false;
   buyCanTrade = true;
   sellCanTrade = true;
}

   for (int i = 0; i < total; i++)
   {
      string symbol = PositionGetSymbol(i);
      if (symbol == _Symbol)
      {
         // Magic Number ham tekshirish
         if(PositionGetInteger(POSITION_MAGIC) != MagicNumber)
            continue;
            
         if (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY)
            signal = "BUY ??";
         else if (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_SELL)
            signal = "SELL ??";
      }
   }

   ShowFathPanel(status, balance, profit, signal, "2.0", "Normal");
   
 
   CloseBuyIfBreakSellEntry();
CloseSellIfBreakBuyEntry();
 CloseYesterdayTradesIfInProfit();
   // Symbol obyekti yangilash
   a_symbol.Name(Symbol());
   a_symbol.Refresh();

   // D1 kechagi yopilish qiymati va Gann Trade Zones
   yesterday_close = iClose(_Symbol, PERIOD_D1, 1);
   
   // Forex juftliklar uchun (kichik narxlar) - floor qilmaymiz
   // Faqat XAUUSD, BTCUSD kabi katta narxlar uchun floor
   if(yesterday_close > 100)
      yesterday_close = MathFloor(yesterday_close);
   
   
   double HighD1 = iHigh(_Symbol,PERIOD_D1,1);
double LowD1 = iLow(_Symbol,PERIOD_D1,1);
double CloseD1 = iClose(_Symbol,PERIOD_D1,1);
double PP = ((HighD1+LowD1+CloseD1)/3);
double R1 = ((PP*2)-LowD1);
double R2 = ((HighD1 - LowD1)+ PP);
double S1 = ((PP*2)-HighD1);
double S2 = (PP-(HighD1 - LowD1));

   // Avtomatik CenterPrice olish (XAUUSD uchun input, boshqalar uchun auto)
   int activeCenterPrice = GetCenterPriceForSymbol();
   
   LevelInfo res = TradeZones(activeCenterPrice, yesterday_close);

   // Agar TradeZones xatolik bo'lsa qaytish
   if(res.lower == -1 || res.upper == -1) {
      return;
   }

   sell_entry = res.sell_entry;
   buy_entry  = res.buy_entry;
   sell_tp1   = res.sell_tp1;
   
   // === CENTER NARXGA QAYTISH TEKSHIRUVI ===
   double currentPrice = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   
   // Agar Buy ochilgan va narx center (yesterday_close) ga tushib borsa -> yana Buy ochish mumkin
   if(buySignalUsed && currentPrice <= yesterday_close)
   {
      buySignalUsed = false;
      buyCanTrade = true;
   }
   
   // Agar Sell ochilgan va narx center (yesterday_close) ga ko'tarilsa -> yana Sell ochish mumkin
   if(sellSignalUsed && currentPrice >= yesterday_close)
   {
      sellSignalUsed = false;
      sellCanTrade = true;
   }
   sell_tp2   = res.sell_tp2;
   buy_tp1    = res.buy_tp1;
   buy_tp2    = res.buy_tp2;

   // Chiziqlarni faqat kun o'zgarganda yangilash (miltillashni oldini olish)
   string close_name="centerLine";
   string sell_name="SellEntryLine";
   string buy_name="BuyEntryLine";
   string selltp1_name="SellTP1";
   string selltp2_name="SellTP2";
   string buytp1_name="BuyTP1";
   string buytp2_name="BuyTP2";

   //datetime todayStart = iTime(_Symbol, PERIOD_D1, 0);
   datetime todayEnd = todayStart + 24 * 3600 - 1;
   
   // Chiziqlarni faqat mavjud bo'lmasa yaratamiz yoki narx o'zgargan bo'lsa yangilaymiz
   if(ObjectFind(0,close_name) == -1)
   {
      ObjectCreate(0,close_name,OBJ_TREND, 0, todayStart, yesterday_close, todayEnd, yesterday_close);
      ObjectSetInteger(0,close_name,OBJPROP_COLOR,clrYellow);
      ObjectSetInteger(0,close_name,OBJPROP_STYLE,STYLE_SOLID);
      ObjectSetInteger(0,close_name,OBJPROP_RAY_RIGHT,false);
   }
   else
   {
      ObjectMove(0,close_name,0,todayStart,yesterday_close);
      ObjectMove(0,close_name,1,todayEnd,yesterday_close);
   }
   
   if(ObjectFind(0,sell_name) == -1)
   {
      ObjectCreate(0,sell_name,OBJ_TREND, 0, todayStart, sell_entry, todayEnd, sell_entry);
      ObjectSetInteger(0,sell_name,OBJPROP_COLOR,clrRed);
      ObjectSetInteger(0,sell_name,OBJPROP_STYLE,STYLE_DASH);
      ObjectSetInteger(0,sell_name,OBJPROP_RAY_RIGHT,false);
   }
   else
   {
      ObjectMove(0,sell_name,0,todayStart,sell_entry);
      ObjectMove(0,sell_name,1,todayEnd,sell_entry);
   }
   
   if(ObjectFind(0,buy_name) == -1)
   {
      ObjectCreate(0,buy_name,OBJ_TREND, 0, todayStart, buy_entry, todayEnd, buy_entry);
      ObjectSetInteger(0,buy_name,OBJPROP_COLOR,clrBlue);
      ObjectSetInteger(0,buy_name,OBJPROP_STYLE,STYLE_DASH);
      ObjectSetInteger(0,buy_name,OBJPROP_RAY_RIGHT,false);
   }
   else
   {
      ObjectMove(0,buy_name,0,todayStart,buy_entry);
      ObjectMove(0,buy_name,1,todayEnd,buy_entry);
   }
   
   if(ObjectFind(0,selltp1_name) == -1)
   {
      ObjectCreate(0,selltp1_name,OBJ_TREND, 0, todayStart, sell_tp1, todayEnd, sell_tp1);
      ObjectSetInteger(0,selltp1_name,OBJPROP_COLOR,clrOrange);
      ObjectSetInteger(0,selltp1_name,OBJPROP_STYLE,STYLE_SOLID);
      ObjectSetInteger(0,selltp1_name,OBJPROP_RAY_RIGHT,false);
   }
   else
   {
      ObjectMove(0,selltp1_name,0,todayStart,sell_tp1);
      ObjectMove(0,selltp1_name,1,todayEnd,sell_tp1);
   }
   
   if(ObjectFind(0,selltp2_name) == -1)
   {
      ObjectCreate(0,selltp2_name,OBJ_TREND, 0, todayStart, sell_tp2, todayEnd, sell_tp2);
      ObjectSetInteger(0,selltp2_name,OBJPROP_COLOR,clrOrangeRed);
      ObjectSetInteger(0,selltp2_name,OBJPROP_STYLE,STYLE_SOLID);
      ObjectSetInteger(0,selltp2_name,OBJPROP_RAY_RIGHT,false);
   }
   else
   {
      ObjectMove(0,selltp2_name,0,todayStart,sell_tp2);
      ObjectMove(0,selltp2_name,1,todayEnd,sell_tp2);
   }
   
   if(ObjectFind(0,buytp1_name) == -1)
   {
      ObjectCreate(0,buytp1_name,OBJ_TREND, 0, todayStart, buy_tp1, todayEnd, buy_tp1);
      ObjectSetInteger(0,buytp1_name,OBJPROP_COLOR,clrBlue);
      ObjectSetInteger(0,buytp1_name,OBJPROP_STYLE,STYLE_SOLID);
      ObjectSetInteger(0,buytp1_name,OBJPROP_RAY_RIGHT,false);
   }
   else
   {
      ObjectMove(0,buytp1_name,0,todayStart,buy_tp1);
      ObjectMove(0,buytp1_name,1,todayEnd,buy_tp1);
   }
   
   if(ObjectFind(0,buytp2_name) == -1)
   {
      ObjectCreate(0,buytp2_name,OBJ_TREND, 0, todayStart, buy_tp2, todayEnd, buy_tp2);
      ObjectSetInteger(0,buytp2_name,OBJPROP_COLOR,clrDodgerBlue);
      ObjectSetInteger(0,buytp2_name,OBJPROP_STYLE,STYLE_SOLID);
      ObjectSetInteger(0,buytp2_name,OBJPROP_RAY_RIGHT,false);
   }
   else
   {
      ObjectMove(0,buytp2_name,0,todayStart,buy_tp2);
      ObjectMove(0,buytp2_name,1,todayEnd,buy_tp2);
   }

   // M15 candle qoidalari: indeksi 1 - oxirgi yopilgan sham
   double cOpen  = iOpen(_Symbol, PERIOD_M15, 1);
   double cClose = iClose(_Symbol, PERIOD_M15, 1);
   double cHigh  = iHigh(_Symbol, PERIOD_M15, 1);
   double cLow   = iLow(_Symbol, PERIOD_M15, 1);

   string sym = Symbol();
   int posCount = PositionsCountForSymbol(sym);

   // Agar allaqachon kerakli pozitsiyalar ochilgan bo'lsa, yana ochmaymiz
   if(posCount >= MaxPositionsPerSymbol)
     {
      // mavjud pozitsiyalar yetarli
      return;
     }
    double Ask = NormalizeDouble(SymbolInfoDouble(_Symbol, SYMBOL_ASK), _Digits);
   bool buy_trigger = (cClose > buy_entry) && (cHigh > buy_entry) && (cOpen < buy_entry || cLow < buy_entry) && (Ask >= cHigh) && Ask > PP;
   bool sell_trigger = (cClose < sell_entry) && (cLow < sell_entry) && (cOpen > sell_entry || cHigh > sell_entry) && (Ask <= cLow) && Ask < PP;
   
    
   

  // Biz buy_trigger va sell_trigger bir vaqtda true bo'lishini oldini olamiz
if(buy_trigger && !sell_trigger && buyCanTrade)
{
   double sl_price = sell_entry; // buy uchun stoploss
   if(buy_tp1 <= 0 || buy_tp2 <= 0) {
     // Print("Buy TP qiymatlari noto'g'ri: TP1 yoki TP2 <=0");
      return;
   }
   double Ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   if(PositionsCountForSymbol(sym) < MaxPositionsPerSymbol)
   {
   UpdateLotAfterLastTrade();
   double lot_to_use = CurrentLot; // Shu lot bilan barcha pozitsiyalar ochiladi

      // 1) Poz1: TP1
      
      if(Teyktype == AVTO)
      {
      if(OpenBuyWithTP(lot_to_use, sl_price, buy_tp1-1))
      {
         BuyTradesToday++;
         buySignalUsed = true;
         buyCanTrade = false;  // Center ga qaytmaguncha Buy ochilmaydi
         Print("Buy poz1 ochildi: SL=", sl_price, " TP=", buy_tp1,
               " | BuyTradesToday=", BuyTradesToday);
         // Telegram signal yuborish
         SendTradeOpenSignal("BUY", lot_to_use, Ask, buy_tp1-1, sl_price);
      }
      }
      
       if(Teyktype == MANUAL)
      {
      if(OpenBuyWithTP(lot_to_use, sl_price, Ask + NormalizeDouble(TP1 *Point(),Digits())))
      {
         BuyTradesToday++;
         buySignalUsed = true;
         buyCanTrade = false;
         Print("Buy poz1 ochildi: SL=", sl_price, " TP=", Ask + NormalizeDouble(TP1 *Point(),Digits()),
               " | BuyTradesToday=", BuyTradesToday);
         // Telegram signal yuborish
         SendTradeOpenSignal("BUY", lot_to_use, Ask, Ask + NormalizeDouble(TP1 *Point(),Digits()), sl_price);
      }
      }
      
       if(Teyktype == PIVOT)
      {
      if(OpenBuyWithTP(CurrentLot, sl_price, NormalizeDouble(R1,Digits())))
      {
         BuyTradesToday++;
         buySignalUsed = true;
         buyCanTrade = false;
         Print("Buy poz1 ochildi: SL=", sl_price, " TP=", Ask + NormalizeDouble(R1,Digits()),
               " | BuyTradesToday=", BuyTradesToday);
         // Telegram signal yuborish
         SendTradeOpenSignal("BUY", CurrentLot, Ask, NormalizeDouble(R1,Digits()), sl_price);
      }
      }
      
      

      // 2) Poz2: TP2 (agar limitga yetmagan bo'lsa)
      if(BuyTradesToday < 2 && PositionsCountForSymbol(sym) < MaxPositionsPerSymbol)
      {
        if(Teyktype == AVTO)
      {
         if(OpenBuyWithTP(lot_to_use, sl_price, buy_tp2-2))
         {
            BuyTradesToday++;
            Print("Buy poz2 ochildi: SL=", sl_price, " TP=", buy_tp2,
                  " | BuyTradesToday=", BuyTradesToday);
         }
         }
         
         if(Teyktype == MANUAL)
      {
         if(OpenBuyWithTP(lot_to_use, sl_price, Ask + NormalizeDouble(TP2 *Point(),Digits())))
         {
            BuyTradesToday++;
            Print("Buy poz2 ochildi: SL=", sl_price, " TP=", Ask + NormalizeDouble(TP2 *Point(),Digits()),
                  " | BuyTradesToday=", BuyTradesToday);
         }
         }
         
          if(Teyktype == PIVOT)
      {
      if(OpenBuyWithTP(CurrentLot, sl_price, NormalizeDouble(R2,Digits())))
      {
         BuyTradesToday++;
         Print("Buy poz1 ochildi: SL=", sl_price, " TP=", Ask + NormalizeDouble(R2,Digits()),
               " | BuyTradesToday=", BuyTradesToday);
      }
      }
         
         
         
      }
   }
}
else if(sell_trigger && !buy_trigger && sellCanTrade)
{
   double sl_price = buy_entry; // sell uchun stoploss
   if(sell_tp1 <= 0 || sell_tp2 <= 0) {
      Print("Sell TP qiymatlari noto'g'ri: TP1 yoki TP2 <=0");
      return;
   }

   if(PositionsCountForSymbol(sym) < MaxPositionsPerSymbol)
   {
   UpdateLotAfterLastTrade();
   double lot_to_use = CurrentLot; // Shu lot bilan barcha pozitsiyalar ochiladi

      // 1) Poz1: TP1
     double Ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
     double Bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
     if(Teyktype == AVTO)
      {
      if(OpenSellWithTP(lot_to_use, sl_price, sell_tp1+1))
      {
         SellTradesToday++;
         sellSignalUsed = true;
         sellCanTrade = false;  // Center ga qaytmaguncha Sell ochilmaydi
         Print("Sell poz1 ochildi: SL=", sl_price, " TP=", sell_tp1,
               " | SellTradesToday=", SellTradesToday);
         // Telegram signal yuborish
         SendTradeOpenSignal("SELL", lot_to_use, Bid, sell_tp1+1, sl_price);
      }
      }
      
      if(Teyktype == MANUAL)
      {
      if(OpenSellWithTP(lot_to_use, sl_price, Ask - NormalizeDouble(TP1 *Point(),Digits())))
      {
         SellTradesToday++;
         sellSignalUsed = true;
         sellCanTrade = false;
         Print("Sell poz1 ochildi: SL=", sl_price, " TP=", NormalizeDouble(TP1 *Point(),Digits()),
               " | SellTradesToday=", SellTradesToday);
         // Telegram signal yuborish
         SendTradeOpenSignal("SELL", lot_to_use, Bid, Bid - NormalizeDouble(TP1 *Point(),Digits()), sl_price);
      }
      }
      
      if(Teyktype == PIVOT)
      {
      if(OpenSellWithTP(CurrentLot, sl_price, NormalizeDouble(S1,Digits())))
      {
         SellTradesToday++;
         sellSignalUsed = true;
         sellCanTrade = false;
         Print("Sell poz1 ochildi: SL=", sl_price, " TP=", NormalizeDouble(S1,Digits()),
               " | SellTradesToday=", SellTradesToday);
         // Telegram signal yuborish
         SendTradeOpenSignal("SELL", CurrentLot, Bid, NormalizeDouble(S1,Digits()), sl_price);
      }
      }
      
      
      

      // 2) Poz2: TP2 (agar limitga yetmagan bo'lsa)
      if(SellTradesToday < 2 && PositionsCountForSymbol(sym) < MaxPositionsPerSymbol)
      {
       if(Teyktype == AVTO)
      {
         if(OpenSellWithTP(lot_to_use, sl_price, sell_tp2+2))
         {
            SellTradesToday++;
            Print("Sell poz2 ochildi: SL=", sl_price, " TP=", sell_tp2,
                  " | SellTradesToday=", SellTradesToday);
         }
         }
         
         if(Teyktype == MANUAL)
      {
         if(OpenSellWithTP(lot_to_use, sl_price, Ask - NormalizeDouble(TP2 *Point(),Digits())))
         {
            SellTradesToday++;
            Print("Sell poz2 ochildi: SL=", sl_price, " TP=", Ask - NormalizeDouble(TP2 *Point(),Digits()),
                  " | SellTradesToday=", SellTradesToday);
         }
         }
         
         if(Teyktype == PIVOT)
      {
      if(OpenSellWithTP(CurrentLot, sl_price, NormalizeDouble(S2 ,Digits())))
      {
         SellTradesToday++;
         Print("Sell poz1 ochildi: SL=", sl_price, " TP=", NormalizeDouble(S2,Digits()),
               " | SellTradesToday=", SellTradesToday);
      }
      }
      }
   }
}
   
   // Breakeven qo'yish - narx TP1 ga yetganda
  // double Ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double Bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   
   if(Ask >= buy_tp1)
     { 
     MoveBuyToBreakeven(BU);
     }
     
   if(Bid <= sell_tp1)
     { 
     MoveSellToBreakeven(BU);
     }
   
   // Telegram funksiyalari
   CheckClosedTrades();      // Yopilgan bitimlarni tekshirish
   SendDailyReport();        // Kunlik hisobot (soat 23:55 da)

   // Heartbeat OnTick boshida amalga oshiriladi (yuqorida)
     
} // end OnTick

//+------------------------------------------------------------------+
//| EA o'chirilganda panel tozalash                                   |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   DeletePanel("FATH_PANEL_");
   Comment("");
}
//+------------------------------------------------------------------+


void CloseYesterdayTradesIfInProfit()
  {
// Joriy kunning boshlanish vaqti
   datetime currentDay = iTime(_Symbol, PERIOD_D1, 0);

// Ochiq buyurtmalarni ko'rib chiqish
   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      ulong ticket = PositionGetTicket(i);
      if(ticket > 0)
        {
         // Bizning pozitsiyami tekshirish (Symbol + Magic)
         if(!IsOurPosition(ticket))
            continue;
            
         // Ochilish vaqtini tekshirish
         datetime openTime = (datetime)PositionGetInteger(POSITION_TIME);

         // Agar kecha ochilgan bo'lsa
         if(openTime < currentDay)
           {
            // Foydani tekshirish
            double profit = PositionGetDouble(POSITION_PROFIT);
            if(profit > 0 || profit < 0)
              {
               // Bitimni yopish
               bool closed = a_trade.PositionClose(ticket);

               if(closed)
                 {
                  Print("Buyurtma yopildi: ", ticket, " foyda: ", profit);
                 }
               else
                 {
                  Print("Buyurtmani yopishda xatolik: ", ticket, " Error: ", GetLastError());
                 }
              }
           }
        }
     }
  }
  
  
  void MoveBuyToBreakeven(double bu_points)
{
   for (int i = 0; i < PositionsTotal(); i++)
   {
      ulong ticket = PositionGetTicket(i);
      if (PositionSelectByTicket(ticket))
      {
         // Faqat bizning pozitsiyalarimiz (Symbol + Magic + BUY)
         if(PositionGetString(POSITION_SYMBOL) != _Symbol)
            continue;
         if(PositionGetInteger(POSITION_MAGIC) != MagicNumber)
            continue;
         if((int)PositionGetInteger(POSITION_TYPE) != POSITION_TYPE_BUY)
            continue;
         
         double open_price = PositionGetDouble(POSITION_PRICE_OPEN);
         double current_sl = PositionGetDouble(POSITION_SL);
         double new_sl = NormalizeDouble(open_price + bu_points * _Point, _Digits);
         
         // Faqat agar joriy SL breakeven'dan past bo'lsa yoki SL yo'q bo'lsa
         if(current_sl < new_sl || current_sl == 0)
         {
            MqlTradeRequest request;
            MqlTradeResult result;
            ZeroMemory(request);
            request.action = TRADE_ACTION_SLTP;
            request.position = ticket;
            request.symbol = _Symbol;
            request.sl = new_sl;
            request.tp = PositionGetDouble(POSITION_TP);
            
            if(!OrderSend(request, result))
            {
               Print("Buy breakeven xatolik: ", result.comment, " | RetCode: ", result.retcode);
            }
            else
            {
               Print("Buy breakeven o'rnatildi: ticket=", ticket, " SL=", new_sl);
               // Telegram xabari yuborish
               SendBreakevenNotification(ticket, "BUY", open_price, new_sl);
            }
         }
      }
   }
}


void MoveSellToBreakeven(double bu_points)
{
   for (int i = 0; i < PositionsTotal(); i++)
   {
      ulong ticket = PositionGetTicket(i);
      if (PositionSelectByTicket(ticket))
      {
         // Faqat bizning pozitsiyalarimiz (Symbol + Magic + SELL)
         if(PositionGetString(POSITION_SYMBOL) != _Symbol)
            continue;
         if(PositionGetInteger(POSITION_MAGIC) != MagicNumber)
            continue;
         if((int)PositionGetInteger(POSITION_TYPE) != POSITION_TYPE_SELL)
            continue;
         
         double open_price = PositionGetDouble(POSITION_PRICE_OPEN);
         double current_sl = PositionGetDouble(POSITION_SL);
         double new_sl = NormalizeDouble(open_price - bu_points * _Point, _Digits);
         
         // Faqat agar joriy SL breakeven'dan yuqori bo'lsa yoki SL yo'q bo'lsa
         if(current_sl > new_sl || current_sl == 0)
         {
            MqlTradeRequest request;
            MqlTradeResult result;
            ZeroMemory(request);
            request.action = TRADE_ACTION_SLTP;
            request.position = ticket;
            request.symbol = _Symbol;
            request.sl = new_sl;
            request.tp = PositionGetDouble(POSITION_TP);
            
            if(!OrderSend(request, result))
            {
               Print("Sell breakeven xatolik: ", result.comment, " | RetCode: ", result.retcode);
            }
            else
            {
               Print("Sell breakeven o'rnatildi: ticket=", ticket, " SL=", new_sl);
               // Telegram xabari yuborish
               SendBreakevenNotification(ticket, "SELL", open_price, new_sl);
            }
         }
      }
   }
}





void CloseBuyIfBreakSellEntry()
{
   double cClose = iClose(_Symbol, PERIOD_M15, 1); // oxirgi yopilgan sham
   if(cClose < sell_entry)
   {
   
      int total = PositionsTotal();
      for(int i = total - 1; i >= 0; i--)
      {
         ulong ticket = PositionGetTicket(i);
         if(PositionSelectByTicket(ticket))
         {
            // Bizning BUY pozitsiyalarimiz (Symbol + Magic)
            if(PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY &&
               PositionGetString(POSITION_SYMBOL) == _Symbol &&
               PositionGetInteger(POSITION_MAGIC) == MagicNumber)
            {
               if(a_trade.PositionClose(ticket))
                  Print("Buy pozitsiya yopildi: M15 sham sell_entry darajasini yorib o'tdi, ticket=", ticket);
               else
                  Print("Buy pozitsiyani yopishda xatolik, ticket=", ticket, " Error=", GetLastError());
            }
         }
      }
   }
}

void CloseSellIfBreakBuyEntry()
{
   double cClose = iClose(_Symbol, PERIOD_M15, 1); // oxirgi yopilgan sham
   if(cClose > buy_entry)
   {
    
      int total = PositionsTotal();
      for(int i = total - 1; i >= 0; i--)
      {
         ulong ticket = PositionGetTicket(i);
         if(PositionSelectByTicket(ticket))
         {
            // Bizning SELL pozitsiyalarimiz (Symbol + Magic)
            if(PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_SELL &&
               PositionGetString(POSITION_SYMBOL) == _Symbol &&
               PositionGetInteger(POSITION_MAGIC) == MagicNumber)
            {
               if(a_trade.PositionClose(ticket))
                  Print("Sell pozitsiya yopildi: M15 sham buy_entry darajasini yorib o'tdi, ticket=", ticket);
               else
                  Print("Sell pozitsiyani yopishda xatolik, ticket=", ticket, " Error=", GetLastError());
            }
         }
      }
   }
}


void UpdateLotAfterLastTrade()
{
   HistorySelect(TimeCurrent() - 86400*5, TimeCurrent()); // so'nggi 5 kunni tekshiramiz
   int deals = HistoryDealsTotal();
   if(deals < 1) return;

   ulong last_deal_ticket = HistoryDealGetTicket(deals-1);

   if(last_deal_ticket > 0)
   {
      string sym = HistoryDealGetString(last_deal_ticket, DEAL_SYMBOL);
      long deal_magic = HistoryDealGetInteger(last_deal_ticket, DEAL_MAGIC);
      
      // Faqat bizning bitimlarimiz (Symbol + Magic)
      if(sym == _Symbol && deal_magic == MagicNumber)
      {
         double profit = HistoryDealGetDouble(last_deal_ticket, DEAL_PROFIT);
         double Lastlot = HistoryDealGetDouble(last_deal_ticket,DEAL_VOLUME);
         Print("Oxirgi lot:" , Lastlot);
         if(profit < 0) 
         {
            if(Recovery_Mode == ON)
            {
            if(Lastlot < Maxlot)
            {
            CurrentLot = Lastlot *2 ; // ikki marta oshiramiz
            }
            
            if(Lastlot >= Maxlot)
            {
            CurrentLot = Maxlot; // ikki marta oshiramiz
            }
            
            }
            
             if(Recovery_Mode == OFF)
            {
            CurrentLot = Lots; 
            }
            
         }
         else if(profit > 0)
         {
           
            CurrentLot = Lots;
            Print("Oxirgi bitim foydali, lot qaytdi: ", CurrentLot);
         }
      }
   }
}




//+------------------------------------------------------------------+
//|     FATH ROBOT - Kengaytirilgan Chiroyli Panel v2.0              |
//|     Ko'proq ma'lumot, gradient ranglar, animatsiya               |
//+------------------------------------------------------------------+

// Global o'zgaruvchilar panel uchun
datetime last_panel_update = 0;
int panel_animation_state = 0;
bool panel_created = false;  // Panel yaratilganmi

//+------------------------------------------------------------------+
//|  Asosiy panel funksiyasi - Barcha ma'lumotlar bilan              |
//+------------------------------------------------------------------+
void ShowFathPanel(string status, double balance, double profit, string signal, string version="1.6", string risk="Normal")
{
   // Panel yangilanish tezligini cheklash (har 2 sekund)
   static datetime lastUpdate = 0;
   if(TimeCurrent() - lastUpdate < 2) return;
   lastUpdate = TimeCurrent();
   
   string prefix = "FATH_PANEL_";
   int x = 15, y = 15;
   
   // Panelni faqat bir marta yaratish, keyin faqat yangilash
   if(!panel_created) {
      DeletePanel(prefix);
      panel_created = true;
   }
   
   // ===============================================================
   // 1. HEADER - Sarlavha
   // ===============================================================
   CreatePanelBackground(prefix + "BG_HEADER", x-5, y-5, 380, 45, C'20,20,40', 2);
   
   color headerColor = (panel_animation_state % 2 == 0) ? clrGold : clrOrange;
   CreatePanelLabel(prefix + "TITLE", ">>> FATH ROBOT V1.6 <<<", 
                    x+10, y+5, "Arial Black", 14, headerColor, CORNER_LEFT_UPPER);
   CreatePanelLabel(prefix + "SUBTITLE", "Gann AI Trading System", 
                    x+10, y+25, "Arial", 8, clrLightSteelBlue, CORNER_LEFT_UPPER);
   
   y += 50;
   
   // ===============================================================
   // 2. ACCOUNT INFO - Hisob ma'lumotlari
   // ===============================================================
   CreatePanelBackground(prefix + "BG_ACCOUNT", x-5, y-5, 380, 95, C'25,25,45', 2);
   CreatePanelLabel(prefix + "SEC_ACCOUNT", "[=== HISOB MA'LUMOTLARI ===]", 
                    x+5, y, "Consolas", 10, clrDodgerBlue, CORNER_LEFT_UPPER);
   y += 20;
   
   // Balans
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double margin = AccountInfoDouble(ACCOUNT_MARGIN);
   double free_margin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   double margin_level = (margin > 0) ? (equity / margin * 100) : 0;
   
   CreatePanelLabel(prefix + "BALANCE_LABEL", "[$] Balans:", 
                    x+10, y, "Arial", 10, clrWhite, CORNER_LEFT_UPPER);
   CreatePanelLabel(prefix + "BALANCE_VALUE", DoubleToString(balance, 2) + " USD", 
                    x+180, y, "Arial Bold", 10, clrLimeGreen, CORNER_LEFT_UPPER);
   y += 18;
   
   // Equity
   CreatePanelLabel(prefix + "EQUITY_LABEL", "[*] Equity:", 
                    x+10, y, "Arial", 10, clrWhite, CORNER_LEFT_UPPER);
   CreatePanelLabel(prefix + "EQUITY_VALUE", DoubleToString(equity, 2) + " USD", 
                    x+180, y, "Arial Bold", 10, clrAqua, CORNER_LEFT_UPPER);
   y += 18;
   
   // Foyda (rang profit/loss ga qarab)
   color profitColor = (profit >= 0) ? clrLimeGreen : clrRed;
   string profitIcon = (profit >= 0) ? "[+]" : "[-]";
   CreatePanelLabel(prefix + "PROFIT_LABEL", profitIcon + " Foyda:", 
                    x+10, y, "Arial", 10, clrWhite, CORNER_LEFT_UPPER);
   CreatePanelLabel(prefix + "PROFIT_VALUE", DoubleToString(profit, 2) + " USD", 
                    x+180, y, "Arial Bold", 10, profitColor, CORNER_LEFT_UPPER);
   y += 18;
   
   // Margin Level
   color marginColor = (margin_level > 200) ? clrLimeGreen : (margin_level > 100) ? clrYellow : clrRed;
   CreatePanelLabel(prefix + "MARGIN_LABEL", "[%] Margin Level:", 
                    x+10, y, "Arial", 10, clrWhite, CORNER_LEFT_UPPER);
   CreatePanelLabel(prefix + "MARGIN_VALUE", DoubleToString(margin_level, 1) + "%", 
                    x+180, y, "Arial Bold", 10, marginColor, CORNER_LEFT_UPPER);
   
   y += 25;
   
   // ===============================================================
   // 3. TRADING INFO - Trading ma'lumotlari
   // ===============================================================
   CreatePanelBackground(prefix + "BG_TRADING", x-5, y-5, 380, 135, C'25,25,45', 2);
   CreatePanelLabel(prefix + "SEC_TRADING", "[=== TRADING HOLATI ===]", 
                    x+5, y, "Consolas", 10, clrDodgerBlue, CORNER_LEFT_UPPER);
   y += 20;
   
   // Instrument
   CreatePanelLabel(prefix + "SYMBOL_LABEL", "[>] Instrument:", 
                    x+10, y, "Arial", 10, clrWhite, CORNER_LEFT_UPPER);
   CreatePanelLabel(prefix + "SYMBOL_VALUE", _Symbol, 
                    x+180, y, "Arial Bold", 10, clrGold, CORNER_LEFT_UPPER);
   y += 18;
   
   // Hozirgi narx
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double spread = ask - bid;
   int spread_points = (int)((spread / SymbolInfoDouble(_Symbol, SYMBOL_POINT)));
   
   CreatePanelLabel(prefix + "BID_LABEL", "[v] Bid:", 
                    x+10, y, "Arial", 10, clrWhite, CORNER_LEFT_UPPER);
   CreatePanelLabel(prefix + "BID_VALUE", DoubleToString(bid, (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS)), 
                    x+180, y, "Arial Bold", 10, clrOrange, CORNER_LEFT_UPPER);
   y += 18;
   
   CreatePanelLabel(prefix + "ASK_LABEL", "[^] Ask:", 
                    x+10, y, "Arial", 10, clrWhite, CORNER_LEFT_UPPER);
   CreatePanelLabel(prefix + "ASK_VALUE", DoubleToString(ask, (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS)), 
                    x+180, y, "Arial Bold", 10, clrAqua, CORNER_LEFT_UPPER);
   y += 18;
   
   CreatePanelLabel(prefix + "SPREAD_LABEL", "[~] Spread:", 
                    x+10, y, "Arial", 10, clrWhite, CORNER_LEFT_UPPER);
   CreatePanelLabel(prefix + "SPREAD_VALUE", IntegerToString(spread_points) + " points", 
                    x+180, y, "Arial Bold", 10, clrYellow, CORNER_LEFT_UPPER);
   y += 18;
   
   // Signal
   color signalColor = (StringFind(signal, "BUY") >= 0) ? clrLimeGreen : 
                       (StringFind(signal, "SELL") >= 0) ? clrRed : clrGray;
   CreatePanelLabel(prefix + "SIGNAL_LABEL", "[!] Signal:", 
                    x+10, y, "Arial", 10, clrWhite, CORNER_LEFT_UPPER);
   CreatePanelLabel(prefix + "SIGNAL_VALUE", signal, 
                    x+180, y, "Arial Bold", 11, signalColor, CORNER_LEFT_UPPER);
   y += 18;
   
   // Ochiq pozitsiyalar (faqat bizning Magic Number)
   int totalPositions = PositionsTotal();
   int buyCount = 0, sellCount = 0;
   double totalVolume = 0;
   for(int i = 0; i < totalPositions; i++)
   {
      if(PositionGetSymbol(i) == _Symbol)
      {
         // Magic Number tekshirish
         if(PositionGetInteger(POSITION_MAGIC) != MagicNumber)
            continue;
            
         totalVolume += PositionGetDouble(POSITION_VOLUME);
         if(PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY)
            buyCount++;
         else if(PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_SELL)
            sellCount++;
      }
   }
   
   CreatePanelLabel(prefix + "POSITIONS_LABEL", "[#] Pozitsiyalar:", 
                    x+10, y, "Arial", 10, clrWhite, CORNER_LEFT_UPPER);
   string posInfo = IntegerToString(buyCount) + " Buy / " + IntegerToString(sellCount) + " Sell";
   CreatePanelLabel(prefix + "POSITIONS_VALUE", posInfo, 
                    x+180, y, "Arial Bold", 10, clrCyan, CORNER_LEFT_UPPER);
   
   y += 25;
   
   // ===============================================================
   // 4. GANN LEVELS - Daraja ma'lumotlari
   // ===============================================================
   CreatePanelBackground(prefix + "BG_GANN", x-5, y-5, 380, 115, C'25,25,45', 2);
   CreatePanelLabel(prefix + "SEC_GANN", "[=== GANN DARAJALAR ===]", 
                    x+5, y, "Consolas", 10, clrDodgerBlue, CORNER_LEFT_UPPER);
   y += 20;
   
   // Center Price (avtomatik yoki qo'lda)
   int activeCenterPrice = GetCenterPriceForSymbol();
   string centerMode = IsManualCenter ? " (manual)" : " (auto)";
   CreatePanelLabel(prefix + "CENTER_LABEL", "[o] Markaziy Narx:", 
                    x+10, y, "Arial", 10, clrWhite, CORNER_LEFT_UPPER);
   CreatePanelLabel(prefix + "CENTER_VALUE", IntegerToString(activeCenterPrice) + centerMode, 
                    x+180, y, "Arial Bold", 10, clrGold, CORNER_LEFT_UPPER);
   y += 18;
   
   // Rejim
   string modeText = "AUTO [+]";
   color modeColor =  clrLimeGreen;
   CreatePanelLabel(prefix + "MODE_LABEL", "[*] Rejim:", 
                    x+10, y, "Arial", 10, clrWhite, CORNER_LEFT_UPPER);
   CreatePanelLabel(prefix + "MODE_VALUE", modeText, 
                    x+180, y, "Arial Bold", 10, modeColor, CORNER_LEFT_UPPER);
   y += 18;
   
   // Support/Resistance - BUY yuqorida (Resistance), SELL pastda (Support)
   if(sell_entry > 0 && buy_entry > 0)
   {
      CreatePanelLabel(prefix + "RESISTANCE_LABEL", "[R] BUY level:", 
                       x+10, y, "Arial", 10, clrWhite, CORNER_LEFT_UPPER);
      CreatePanelLabel(prefix + "RESISTANCE_VALUE", DoubleToString(buy_entry, (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS)), 
                       x+180, y, "Arial Bold", 10, clrLimeGreen, CORNER_LEFT_UPPER);
      y += 18;
      
      CreatePanelLabel(prefix + "SUPPORT_LABEL", "[S] SELL level:", 
                       x+10, y, "Arial", 10, clrWhite, CORNER_LEFT_UPPER);
      CreatePanelLabel(prefix + "SUPPORT_VALUE", DoubleToString(sell_entry, (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS)), 
                       x+180, y, "Arial Bold", 10, clrRed, CORNER_LEFT_UPPER);
      y += 18;
   }
   
   // TP Levels
   CreatePanelLabel(prefix + "TP_LABEL", "[T] TP Mode:", 
                    x+10, y, "Arial", 10, clrWhite, CORNER_LEFT_UPPER);
   string tpText = (Teyktype == AVTO) ? "AVTO" : (Teyktype == MANUAL) ? "MANUAL" : "PIVOT";
   CreatePanelLabel(prefix + "TP_VALUE", tpText, 
                    x+180, y, "Arial Bold", 10, clrCyan, CORNER_LEFT_UPPER);
   
   y += 25;
   
   // ===============================================================
   // 5. STATISTICS - Statistika
   // ===============================================================
   CreatePanelBackground(prefix + "BG_STATS", x-5, y-5, 380, 95, C'25,25,45', 2);
   CreatePanelLabel(prefix + "SEC_STATS", "[=== STATISTIKA ===]", 
                    x+5, y, "Consolas", 10, clrDodgerBlue, CORNER_LEFT_UPPER);
   y += 20;
   
   // Bugungi trade'lar
   CreatePanelLabel(prefix + "TRADES_TODAY_LABEL", "[D] Bugun:", 
                    x+10, y, "Arial", 10, clrWhite, CORNER_LEFT_UPPER);
   string todayTrades = IntegerToString(BuyTradesToday) + " Buy / " + IntegerToString(SellTradesToday) + " Sell";
   CreatePanelLabel(prefix + "TRADES_TODAY_VALUE", todayTrades, 
                    x+180, y, "Arial Bold", 10, clrYellow, CORNER_LEFT_UPPER);
   y += 18;
   
   // Joriy lot
   CreatePanelLabel(prefix + "LOT_LABEL", "[L] Joriy Lot:", 
                    x+10, y, "Arial", 10, clrWhite, CORNER_LEFT_UPPER);
   CreatePanelLabel(prefix + "LOT_VALUE", DoubleToString(CurrentLot, 2), 
                    x+180, y, "Arial Bold", 10, clrOrange, CORNER_LEFT_UPPER);
   y += 18;
   
   // Recovery Mode
   string recoveryText = (Recovery_Mode == ON) ? "ON [+]" : "OFF [-]";
   color recoveryColor = (Recovery_Mode == ON) ? clrLimeGreen : clrRed;
   CreatePanelLabel(prefix + "RECOVERY_LABEL", "[R] Recovery:", 
                    x+10, y, "Arial", 10, clrWhite, CORNER_LEFT_UPPER);
   CreatePanelLabel(prefix + "RECOVERY_VALUE", recoveryText, 
                    x+180, y, "Arial Bold", 10, recoveryColor, CORNER_LEFT_UPPER);
   y += 18;
   
   // Risk Level
   CreatePanelLabel(prefix + "RISK_LABEL", "[!] Risk:", 
                    x+10, y, "Arial", 10, clrWhite, CORNER_LEFT_UPPER);
   CreatePanelLabel(prefix + "RISK_VALUE", risk, 
                    x+180, y, "Arial Bold", 10, clrYellow, CORNER_LEFT_UPPER);
   
   y += 25;
   
   // ===============================================================
   // 6. FOOTER - Status va vaqt
   // ===============================================================
   CreatePanelBackground(prefix + "BG_FOOTER", x-5, y-5, 380, 50, C'20,20,40', 2);
   
   // Status
   color statusColor = (StringFind(status, "Ishlayapti") >= 0 || StringFind(status, "Active") >= 0) ? clrLimeGreen : clrRed;
   string statusIcon = (StringFind(status, "Ishlayapti") >= 0 || StringFind(status, "Active") >= 0) ? "[OK]" : "[--]";
   CreatePanelLabel(prefix + "STATUS", statusIcon + " " + status, 
                    x+10, y+5, "Arial Bold", 10, statusColor, CORNER_LEFT_UPPER);
   
   // Vaqt
   CreatePanelLabel(prefix + "TIME", "[T] " + TimeToString(TimeCurrent(), TIME_DATE|TIME_SECONDS), 
                    x+10, y+25, "Arial", 9, clrSilver, CORNER_LEFT_UPPER);
   
   // AI Engine badge
   CreatePanelLabel(prefix + "AI_BADGE", "FATH AI", 
                    x+300, y+15, "Arial Bold", 9, clrGold, CORNER_LEFT_UPPER);
   
   // Animatsiya holati yangilash
   panel_animation_state++;
}

//+------------------------------------------------------------------+
//|  Yordamchi funksiyalar                                           |
//+------------------------------------------------------------------+

// Panel label yaratish yoki yangilash
void CreatePanelLabel(string name, string text, int x, int y, string font, int size, color clr, ENUM_BASE_CORNER corner = CORNER_LEFT_UPPER)
{
   // Agar mavjud bo'lsa - faqat matnni yangilash
   if(ObjectFind(0, name) >= 0) {
      ObjectSetString(0, name, OBJPROP_TEXT, text);
      ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
      return;
   }
   
   // Yangi yaratish
   ObjectCreate(0, name, OBJ_LABEL, 0, 0, 0);
   ObjectSetString(0, name, OBJPROP_TEXT, text);
   ObjectSetString(0, name, OBJPROP_FONT, font);
   ObjectSetInteger(0, name, OBJPROP_FONTSIZE, size);
   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetInteger(0, name, OBJPROP_CORNER, corner);
   ObjectSetInteger(0, name, OBJPROP_XDISTANCE, x);
   ObjectSetInteger(0, name, OBJPROP_YDISTANCE, y);
   ObjectSetInteger(0, name, OBJPROP_BACK, false);
   ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
}

// Panel fon yaratish (Rectangle)
void CreatePanelBackground(string name, int x, int y, int width, int height, color bgColor, int border_width = 1)
{
   // Agar mavjud bo'lsa - o'tkazib yuborish
   if(ObjectFind(0, name) >= 0) return;
   
   ObjectCreate(0, name, OBJ_RECTANGLE_LABEL, 0, 0, 0);
   ObjectSetInteger(0, name, OBJPROP_XDISTANCE, x);
   ObjectSetInteger(0, name, OBJPROP_YDISTANCE, y);
   ObjectSetInteger(0, name, OBJPROP_XSIZE, width);
   ObjectSetInteger(0, name, OBJPROP_YSIZE, height);
   ObjectSetInteger(0, name, OBJPROP_BGCOLOR, bgColor);
   ObjectSetInteger(0, name, OBJPROP_BORDER_TYPE, BORDER_FLAT);
   ObjectSetInteger(0, name, OBJPROP_CORNER, CORNER_LEFT_UPPER);
   ObjectSetInteger(0, name, OBJPROP_COLOR, clrDodgerBlue);
   ObjectSetInteger(0, name, OBJPROP_WIDTH, border_width);
   ObjectSetInteger(0, name, OBJPROP_BACK, true);
   ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
}

// Panelni tozalash
void DeletePanel(string prefix)
{
   for(int i = ObjectsTotal(0, 0, -1) - 1; i >= 0; i--)
   {
      string objName = ObjectName(0, i, 0, -1);
      if(StringFind(objName, prefix) == 0)
      {
         ObjectDelete(0, objName);
      }
   }
}

//+------------------------------------------------------------------+
//|   Hozir ochiq bitim turini aniqlovchi funksiya                   |
//+------------------------------------------------------------------+
string GetCurrentSignal()
{
   string signal = "Kutish ?";
   int total = PositionsTotal();

   for (int i = 0; i < total; i++)
   {
      string symbol = PositionGetSymbol(i);
      if (symbol == _Symbol)
      {
         // Magic Number tekshirish
         if(PositionGetInteger(POSITION_MAGIC) != MagicNumber)
            continue;
            
         if (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY)
            signal = "BUY ??";
         else if (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_SELL)
            signal = "SELL ??";
      }
   }

   return signal;
}


//+------------------------------------------------------------------+
//| Bugun trading mumkinligini tekshirish                             |
//+------------------------------------------------------------------+
bool IsTradingAllowedToday()
{
    MqlDateTime dt;
    TimeToStruct(TimeCurrent(), dt);
    
    switch(dt.day_of_week)
    {
        case 1: return TradingOnMonday;    // Dushanba
        case 2: return TradingOnTuesday;   // Seshanba
        case 3: return TradingOnWednesday; // Chorshanba
        case 4: return TradingOnThursday;  // Payshanba
        case 5: return TradingOnFriday;    // Juma
        default: return false;              // Shanba va Yakshanba
    }
}

//+------------------------------------------------------------------+
//| Serverdan litsenziyani tekshirish (OnInit chaqiradi)             |
//+------------------------------------------------------------------+
bool CheckLicenseOnServer()
{
   if(MQLInfoInteger(MQL_TESTER)) return true;
   if(StringLen(SiteApiBaseUrl) < 10 || StringLen(SiteLicenseKey) < 8)
      return false;

   string endpoint = SiteApiBaseUrl;
   if(StringSubstr(endpoint, StringLen(endpoint)-1, 1) == "/")
      endpoint = StringSubstr(endpoint, 0, StringLen(endpoint)-1);
   endpoint += "/api/ea/activate";

   long   login      = AccountInfoInteger(ACCOUNT_LOGIN);
   string account_id = (string)login;
   string terminal   = TerminalInfoString(TERMINAL_NAME);
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double freeMargin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   double margin = AccountInfoDouble(ACCOUNT_MARGIN);
   double marginLevel = (margin > 0) ? (equity / margin * 100.0) : 0.0;
   int openPositions = PositionsTotal();

   string json = "{" +
      "\"licenseKey\":\"" + JsonEscapeSimple(SiteLicenseKey) + "\"," +
      "\"accountId\":\""  + account_id + "\"," +
      "\"terminalId\":\""  + JsonEscapeSimple(terminal) + "\"," +
      "\"symbol\":\"" + JsonEscapeSimple(_Symbol) + "\"," +
      "\"balance\":" + DoubleToString(balance, 2) + "," +
      "\"equity\":" + DoubleToString(equity, 2) + "," +
      "\"freeMargin\":" + DoubleToString(freeMargin, 2) + "," +
      "\"marginLevel\":" + DoubleToString(marginLevel, 2) + "," +
      "\"openPositions\":" + IntegerToString(openPositions) + "," +
      "\"eaVersion\":\"1.6\"" +
   "}";

   char data[]; char result[]; string rh;
   StringToCharArray(json, data, 0, WHOLE_ARRAY, CP_UTF8);
   ArrayResize(data, ArraySize(data)-1);

   string headers = "Content-Type: application/json\r\n";
   if(StringLen(SiteApiSecret) > 0)
      headers += "x-ea-secret: " + SiteApiSecret + "\r\n";

   g_licenseBlockReason = "";

   ResetLastError();
   int res = WebRequest("POST", endpoint, headers, 8000, data, result, rh);
   string resp = "";

   // Agar asosiy URL 404 qaytarsa, fallback URL bilan qayta urinib ko'ramiz
   if(res == 404 && StringLen(SiteApiFallbackUrl) > 10)
   {
      string fallback = SiteApiFallbackUrl;
      if(StringSubstr(fallback, StringLen(fallback)-1, 1) == "/")
         fallback = StringSubstr(fallback, 0, StringLen(fallback)-1);
      fallback += "/api/ea/activate";

      if(SiteSyncDebugLog)
         Print("CheckLicense: fallback URL sinovi -> ", fallback);

      ResetLastError();
      res = WebRequest("POST", fallback, headers, 8000, data, result, rh);
   }

   if(res < 0)
   {
      Print("CheckLicense: WebRequest xato kodi=", GetLastError());
      g_licenseBlockReason = "network_error_" + (string)GetLastError();
      return false;
   }

   resp = CharArrayToString(result);
   if(SiteSyncDebugLog) Print("CheckLicense response: ", resp);

   if(StringFind(resp, "\"valid\":true") >= 0)
   {
      // expiresAt ni qiqarib olish (oddiy qidirish)
      int idx = StringFind(resp, "\"expiresAt\":\"");
      if(idx >= 0)
      {
         int start = idx + 13;
         int end   = StringFind(resp, "\"", start);
         if(end > start)
            g_licenseExpiry = StringSubstr(resp, start, end - start);
      }
      Print("Litsenziya tasdiqlandi. Muddat: ", g_licenseExpiry);
      return true;
   }

   // Sabab kodini qiqarib chiqarish
   g_licenseBlockReason = "";
   int ri = StringFind(resp, "\"reason\":\"");
   if(ri >= 0)
   {
      int rs = ri + 10;
      int re = StringFind(resp, "\"", rs);
      if(re > rs) g_licenseBlockReason = StringSubstr(resp, rs, re - rs);
   }
   // 404 yoki bo'sh reason => server xatosi (endpoint mavjud emas), bloklamaymiz
   if(res == 404 && StringLen(g_licenseBlockReason) == 0)
      g_licenseBlockReason = "endpoint_unavailable";
   Print("Litsenziya tekshiruvi natijasi: ", g_licenseBlockReason, "  (HTTP ", res, ")");
   return false;
}

//+------------------------------------------------------------------+
//| Heartbeat: har 30 daqiqada serverni xabardor qilish               |
//+------------------------------------------------------------------+
bool SendHeartbeatToServer()
{
   if(MQLInfoInteger(MQL_TESTER)) return true;
   if(StringLen(SiteApiBaseUrl) < 10 || StringLen(SiteLicenseKey) < 8)
      return false;

   string endpoint = SiteApiBaseUrl;
   if(StringSubstr(endpoint, StringLen(endpoint)-1, 1) == "/")
      endpoint = StringSubstr(endpoint, 0, StringLen(endpoint)-1);
   endpoint += "/api/ea/heartbeat";

   long   login     = AccountInfoInteger(ACCOUNT_LOGIN);
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double freeMargin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   double margin = AccountInfoDouble(ACCOUNT_MARGIN);
   double marginLevel = (margin > 0) ? (equity / margin * 100.0) : 0.0;
   int openPositions = PositionsTotal();
   string json = "{" +
      "\"licenseKey\":\"" + JsonEscapeSimple(SiteLicenseKey) + "\"," +
      "\"accountId\":\""  + (string)login + "\"," +
      "\"terminalId\":\""  + JsonEscapeSimple(TerminalInfoString(TERMINAL_NAME)) + "\"," +
      "\"symbol\":\"" + JsonEscapeSimple(_Symbol) + "\"," +
      "\"balance\":" + DoubleToString(balance, 2) + "," +
      "\"equity\":" + DoubleToString(equity, 2) + "," +
      "\"freeMargin\":" + DoubleToString(freeMargin, 2) + "," +
      "\"marginLevel\":" + DoubleToString(marginLevel, 2) + "," +
      "\"openPositions\":" + IntegerToString(openPositions) +
   "}";

   char data[]; char result[]; string rh;
   StringToCharArray(json, data, 0, WHOLE_ARRAY, CP_UTF8);
   ArrayResize(data, ArraySize(data)-1);

   string headers = "Content-Type: application/json\r\n";
   if(StringLen(SiteApiSecret) > 0)
      headers += "x-ea-secret: " + SiteApiSecret + "\r\n";
   ResetLastError();
   int res = WebRequest("POST", endpoint, headers, 5000, data, result, rh);

   if(res == 404 && StringLen(SiteApiFallbackUrl) > 10)
   {
      string fallback = SiteApiFallbackUrl;
      if(StringSubstr(fallback, StringLen(fallback)-1, 1) == "/")
         fallback = StringSubstr(fallback, 0, StringLen(fallback)-1);
      fallback += "/api/ea/heartbeat";
      ResetLastError();
      res = WebRequest("POST", fallback, headers, 5000, data, result, rh);
   }

   if(res < 0)
   {
      if(SiteSyncDebugLog) Print("Heartbeat xato: ", GetLastError());
      return false;
   }

   string resp = CharArrayToString(result);
   bool ok = StringFind(resp, "\"valid\":true") >= 0;

   if(!ok)
   {
      // Litsenziya muddati o'tdi yoki bekor qilindi
      int ri = StringFind(resp, "\"reason\":\"");
      string reason = "";
      if(ri >= 0)
      {
         int rs = ri + 10;
         int re = StringFind(resp, "\"", rs);
         if(re > rs) reason = StringSubstr(resp, rs, re - rs);
      }
      Print("Heartbeat: litsenziya noto'g'ri, sabab=", reason, ". EA bloklanmoqda.");
      g_licenseValid = false;
      ExpertRemove(); // EA ni o'chirish
   }

   if(SiteSyncDebugLog) Print("Heartbeat: ", ok ? "OK" : "FAILED");
   return ok;
}

// JsonEscape aliasi (maxsus belgilar uchun sodda versiya)
string JsonEscapeSimple(string value)
{
   string out = value;
   StringReplace(out, "\\", "\\\\");
   StringReplace(out, "\"", "\\\"");
   return out;
}

string JsonEscape(string value)
{
   string out = value;
   StringReplace(out, "\\", "\\\\");
   StringReplace(out, "\"", "\\\"");
   StringReplace(out, "\r", "");
   StringReplace(out, "\n", " ");
   return out;
}

string ToIsoDateTime(datetime value)
{
   MqlDateTime dt;
   TimeToStruct(value, dt);
   return StringFormat("%04d-%02d-%02dT%02d:%02d:%02dZ", dt.year, dt.mon, dt.day, dt.hour, dt.min, dt.sec);
}

bool SendTradeResultToSite(
   ulong ticket,
   string symbol,
   string side,
   double lot,
   double profit,
   double open_price,
   double close_price,
   double commission,
   double swap,
   datetime opened_at,
   datetime closed_at
)
{
   if(MQLInfoInteger(MQL_TESTER))
      return false;

   if(!EnableSiteTradeSync)
      return false;

   if(StringLen(SiteApiBaseUrl) < 10 || StringLen(SiteLicenseKey) < 8)
   {
      if(SiteSyncDebugLog)
         Print("Site sync o'tkazib yuborildi: SiteApiBaseUrl yoki SiteLicenseKey to'ldirilmagan");
      return false;
   }

   string endpoint = SiteApiBaseUrl;
   if(StringSubstr(endpoint, StringLen(endpoint) - 1, 1) == "/")
      endpoint = StringSubstr(endpoint, 0, StringLen(endpoint) - 1);
   endpoint += "/api/ea/trade-result";

   long login = AccountInfoInteger(ACCOUNT_LOGIN);
   string account_id = IntegerToString((int)login);
   string side_lc = side;
   StringToLower(side_lc);
   string ticket_text = (string)ticket;

   string json = "{" +
      "\"licenseKey\":\"" + JsonEscape(SiteLicenseKey) + "\"," +
      "\"accountId\":\"" + JsonEscape(account_id) + "\"," +
      "\"ticket\":\"" + ticket_text + "\"," +
      "\"symbol\":\"" + JsonEscape(symbol) + "\"," +
      "\"side\":\"" + JsonEscape(side_lc) + "\"," +
      "\"volume\":" + DoubleToString(lot, 2) + "," +
      "\"pnl\":" + DoubleToString(profit, 2) + "," +
      "\"openPrice\":" + DoubleToString(open_price, _Digits) + "," +
      "\"closePrice\":" + DoubleToString(close_price, _Digits) + "," +
      "\"commission\":" + DoubleToString(commission, 2) + "," +
      "\"swap\":" + DoubleToString(swap, 2) + "," +
      "\"openedAt\":\"" + ToIsoDateTime(opened_at) + "\"," +
      "\"closedAt\":\"" + ToIsoDateTime(closed_at) + "\"," +
      "\"terminalId\":\"" + JsonEscape(TerminalInfoString(TERMINAL_NAME)) + "\"," +
      "\"eaVersion\":\"1.6\"" +
   "}";

   char data[];
   StringToCharArray(json, data, 0, WHOLE_ARRAY, CP_UTF8);
   ArrayResize(data, ArraySize(data) - 1);

   string headers = "Content-Type: application/json\r\n";
   if(StringLen(SiteApiSecret) > 0)
      headers += "x-ea-secret: " + SiteApiSecret + "\r\n";

   char result[];
   string result_headers;

   ResetLastError();
   int res = WebRequest("POST", endpoint, headers, 7000, data, result, result_headers);
   if(res == -1)
   {
      if(SiteSyncDebugLog)
         Print("Site sync WebRequest xato: ", GetLastError());
      return false;
   }

   string response = CharArrayToString(result);
   if(res >= 200 && res < 300)
   {
      if(SiteSyncDebugLog)
         Print("Site sync OK, ticket=", ticket, " response=", response);
      return true;
   }

   if(SiteSyncDebugLog)
      Print("Site sync HTTP xato: ", res, " response=", response);
   return false;
}


//+------------------------------------------------------------------+
//|                    TELEGRAM FUNKSIYALARI                          |
//+------------------------------------------------------------------+

//+------------------------------------------------------------------+
//| Telegram ga matn xabar yuborish                                   |
//+------------------------------------------------------------------+
bool SendTelegramMessage(string message)
{
   // Tester rejimida ishlamaydi
   if(MQLInfoInteger(MQL_TESTER))
      return false;
      
   if(!SendTelegramSignals || StringLen(TelegramBotToken) < 10 || StringLen(TelegramChatID) < 1)
      return false;
   
   string url = "https://api.telegram.org/bot" + TelegramBotToken + "/sendMessage";
   
   // Maxsus belgilarni escape qilish
   StringReplace(message, "&", "%26");
   StringReplace(message, "#", "%23");
   StringReplace(message, "+", "%2B");
   
   string params = "chat_id=" + TelegramChatID + "&text=" + message;
   
   char data[];
   char result[];
   string result_headers;
   
   StringToCharArray(params, data, 0, WHOLE_ARRAY, CP_UTF8);
   ArrayResize(data, ArraySize(data)-1); // null terminator olib tashlash
   
   string headers = "Content-Type: application/x-www-form-urlencoded\r\n";
   
   ResetLastError();
   int res = WebRequest("POST", url, headers, 5000, data, result, result_headers);
   
   if(res == -1)
   {
      int err = GetLastError();
      Print("Telegram xabar yuborishda xatolik: ", err);
      return false;
   }
   
   string response = CharArrayToString(result);
   if(StringFind(response, "\"ok\":true") >= 0)
   {
      Print("Telegram xabar yuborildi");
      return true;
   }
   else
   {
      Print("Telegram xato: ", response);
      return false;
   }
}

//+------------------------------------------------------------------+
//| Screenshot olish va saqlash                                       |
//+------------------------------------------------------------------+
string TakeChartScreenshot()
{
   // Tester rejimida ishlamaydi
   if(MQLInfoInteger(MQL_TESTER))
      return "";
      
   string filename = "FATH_" + _Symbol + "_" + TimeToString(TimeCurrent(), TIME_DATE) + "_" + 
                     IntegerToString(GetTickCount()) + ".png";
   
   // Files papkasiga saqlash
   if(ChartScreenShot(0, filename, 1920, 1080, ALIGN_RIGHT))
   {
      return filename;
   }
   else
   {
      return "";
   }
}

//+------------------------------------------------------------------+
//| Telegram ga rasm yuborish                                         |
//+------------------------------------------------------------------+
bool SendTelegramPhoto(string filename, string caption)
{
   // Tester rejimida ishlamaydi
   if(MQLInfoInteger(MQL_TESTER))
      return false;
      
   if(!SendTelegramSignals || StringLen(TelegramBotToken) < 10 || StringLen(TelegramChatID) < 1)
      return false;
   
   // Fayl yo'lini olish
   string filepath = TerminalInfoString(TERMINAL_DATA_PATH) + "\\MQL5\\Files\\" + filename;
   
   // Faylni o'qish
   int filehandle = FileOpen(filename, FILE_READ|FILE_BIN);
   if(filehandle == INVALID_HANDLE)
   {
      Print("Fayl ochilmadi: ", filename, " Error: ", GetLastError());
      // Faqat matn yuborish
      SendTelegramMessage(caption);
      return false;
   }
   
   int filesize = (int)FileSize(filehandle);
   uchar filedata[];
   ArrayResize(filedata, filesize);
   FileReadArray(filehandle, filedata, 0, filesize);
   FileClose(filehandle);
   
   // Multipart form-data yaratish
   string boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
   string url = "https://api.telegram.org/bot" + TelegramBotToken + "/sendPhoto";
   
   // Caption escape
   StringReplace(caption, "&", "%26");
   StringReplace(caption, "#", "%23");
   
   // Body yaratish
   string body_start = "--" + boundary + "\r\n" +
                       "Content-Disposition: form-data; name=\"chat_id\"\r\n\r\n" + 
                       TelegramChatID + "\r\n" +
                       "--" + boundary + "\r\n" +
                       "Content-Disposition: form-data; name=\"caption\"\r\n\r\n" + 
                       caption + "\r\n" +
                       "--" + boundary + "\r\n" +
                       "Content-Disposition: form-data; name=\"photo\"; filename=\"" + filename + "\"\r\n" +
                       "Content-Type: image/png\r\n\r\n";
   
   string body_end = "\r\n--" + boundary + "--\r\n";
   
   // Barcha ma'lumotlarni birlashtirish
   uchar start_data[];
   uchar end_data[];
   StringToCharArray(body_start, start_data, 0, WHOLE_ARRAY, CP_UTF8);
   StringToCharArray(body_end, end_data, 0, WHOLE_ARRAY, CP_UTF8);
   
   // Null terminator olib tashlash
   ArrayResize(start_data, ArraySize(start_data)-1);
   ArrayResize(end_data, ArraySize(end_data)-1);
   
   // Birlashtirish
   uchar post_data[];
   int total_size = ArraySize(start_data) + ArraySize(filedata) + ArraySize(end_data);
   ArrayResize(post_data, total_size);
   
   int pos = 0;
   for(int i = 0; i < ArraySize(start_data); i++)
      post_data[pos++] = start_data[i];
   for(int i = 0; i < ArraySize(filedata); i++)
      post_data[pos++] = filedata[i];
   for(int i = 0; i < ArraySize(end_data); i++)
      post_data[pos++] = end_data[i];
   
   // Yuborish
   char result[];
   string result_headers;
   string headers = "Content-Type: multipart/form-data; boundary=" + boundary + "\r\n";
   
   ResetLastError();
   int res = WebRequest("POST", url, headers, 10000, post_data, result, result_headers);
   
   if(res == -1)
   {
      int err = GetLastError();
      Print("Telegram rasm yuborishda xatolik: ", err);
      // Faqat matn yuborish
      SendTelegramMessage(caption);
      return false;
   }
   
   string response = CharArrayToString(result);
   if(StringFind(response, "\"ok\":true") >= 0)
   {
      Print("Telegram rasm yuborildi");
      // Faylni o'chirish
      FileDelete(filename);
      return true;
   }
   else
   {
      Print("Telegram rasm xato: ", response);
      SendTelegramMessage(caption);
      return false;
   }
}

//+------------------------------------------------------------------+
//| Bitim ochilganda signal yuborish                                  |
//+------------------------------------------------------------------+
void SendTradeOpenSignal(string tradeType, double lot, double entryPrice, double tp, double sl)
{
   // Tester rejimida ishlamaydi
   if(MQLInfoInteger(MQL_TESTER)) return;
   if(!SendTelegramSignals) return;
   
   string screenshot = TakeChartScreenshot();
   
   // Emojilar - Unicode orqali
   string e_chart = (tradeType == "BUY") ? Emoji(0x1F4C8) : Emoji(0x1F4C9); // 📈 yoki 📉
   string e_green = Emoji(0x1F7E2);   // 🟢
   string e_red = Emoji(0x1F534);     // 🔴
   string e_target = Emoji(0x1F3AF); // 🎯
   string e_money = Emoji(0x1F4B0);  // 💰
   string e_stock = Emoji(0x1F4B9);  // 💹
   string e_box = Emoji(0x1F4E6);    // 📦
   string e_check = Emoji(0x2705);   // ✅
   string e_cross = Emoji(0x274C);   // ❌
   string e_warn = Emoji(0x26A0);    // ⚠
   string e_clock = Emoji(0x23F0);   // ⏰
   string e_robot = Emoji(0x1F916); // 🤖
   
   string arrow = (tradeType == "BUY") ? e_green + " BUY (LONG)" : e_red + " SELL (SHORT)";
   
   string message = e_chart + " YANGI SIGNAL\n" +
                    "====================\n\n" +
                    e_target + " " + arrow + "\n\n" +
                    e_stock + " Juftlik: " + _Symbol + "\n" +
                    e_money + " Narx: " + DoubleToString(entryPrice, (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS)) + "\n" +
                    e_box + " Hajm: " + DoubleToString(lot, 2) + " lot\n\n" +
                    e_check + " Take Profit: " + DoubleToString(tp, (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS)) + "\n" +
                    e_cross + " Stop Loss: " + ((sl > 0) ? DoubleToString(sl, (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS)) : "Belgilanmagan") + "\n\n" +
                    "====================\n" +
                    e_warn + " OGOHLANTIRISH:\n" +
                    "Bu signal faqat malumot uchun.\n" +
                    "Savdo qilishdan oldin oz tahlil\n" +
                    "qiling. Xavf oz zimmangizda!\n\n" +
                    e_clock + " " + TimeToString(TimeCurrent(), TIME_DATE|TIME_SECONDS) + "\n" +
                    e_robot + " FATH Robot v1.6";
   
   if(StringLen(screenshot) > 0)
      SendTelegramPhoto(screenshot, message);
   else
      SendTelegramMessage(message);
}

//+------------------------------------------------------------------+
//| Bitim yopilganda xabar yuborish                                   |
//+------------------------------------------------------------------+
void SendTradeCloseSignal(string tradeType, double lot, double openPrice, double closePrice, double profit)
{
   // Tester rejimida ishlamaydi
   if(MQLInfoInteger(MQL_TESTER)) return;
   if(!SendTelegramSignals) return;
   
   string screenshot = TakeChartScreenshot();
   
   // Emojilar
   string e_party = Emoji(0x1F389);   // 🎉
   string e_sad = Emoji(0x1F614);     // 😔
   string e_check = Emoji(0x2705);    // ✅
   string e_cross = Emoji(0x274C);    // ❌
   string e_stock = Emoji(0x1F4B9);   // 💹
   string e_refresh = Emoji(0x1F504); // 🔄
   string e_box = Emoji(0x1F4E6);     // 📦
   string e_chart = Emoji(0x1F4CA);   // 📊
   string e_ruler = Emoji(0x1F4CF);   // 📏
   string e_money = Emoji(0x1F4B5);   // 💵
   string e_loss = Emoji(0x1F4B8);    // 💸
   string e_clock = Emoji(0x23F0);    // ⏰
   string e_robot = Emoji(0x1F916);   // 🤖
   
   string result_emoji = (profit >= 0) ? e_party : e_sad;
   string result_text = (profit >= 0) ? e_check + " YUTILDI" : e_cross + " YOQOTILDI";
   string profit_text = (profit >= 0) ? "+" + DoubleToString(profit, 2) : DoubleToString(profit, 2);
   string profit_emoji = (profit >= 0) ? e_money : e_loss;
   
   double pips = MathAbs(closePrice - openPrice) / _Point;
   
   string message = result_emoji + " BITIM YOPILDI\n" +
                    "====================\n\n" +
                    result_text + "\n\n" +
                    e_stock + " Juftlik: " + _Symbol + "\n" +
                    e_refresh + " Yonalish: " + tradeType + "\n" +
                    e_box + " Hajm: " + DoubleToString(lot, 2) + " lot\n\n" +
                    e_chart + " Ochilish: " + DoubleToString(openPrice, (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS)) + "\n" +
                    e_chart + " Yopilish: " + DoubleToString(closePrice, (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS)) + "\n" +
                    e_ruler + " Punktlar: " + DoubleToString(pips, 0) + "\n\n" +
                    profit_emoji + " Natija: " + profit_text + " USD\n\n" +
                    "====================\n" +
                    e_clock + " " + TimeToString(TimeCurrent(), TIME_DATE|TIME_SECONDS) + "\n" +
                    e_robot + " FATH Robot v1.6";
   
   if(StringLen(screenshot) > 0)
      SendTelegramPhoto(screenshot, message);
   else
      SendTelegramMessage(message);
   
   // Kunlik statistikani yangilash
   dailyTrades++;
   dailyProfit += profit;
   if(profit >= 0)
      dailyWins++;
   else
      dailyLosses++;
}

//+------------------------------------------------------------------+
//| Breakeven o'rnatilganda xabar yuborish                            |
//+------------------------------------------------------------------+
void SendBreakevenNotification(ulong ticket, string tradeType, double openPrice, double newSL)
{
   // Tester rejimida ishlamaydi
   if(MQLInfoInteger(MQL_TESTER)) return;
   if(!SendTelegramSignals) return;
   
   // Allaqachon xabar yuborilganmi tekshirish
   for(int i = 0; i < ArraySize(breakevenTickets); i++)
   {
      if(breakevenTickets[i] == ticket)
         return; // Allaqachon yuborilgan
   }
   
   // Ticket qo'shish
   int size = ArraySize(breakevenTickets);
   ArrayResize(breakevenTickets, size + 1);
   breakevenTickets[size] = ticket;
   
   // Emojilar
   string e_shield = Emoji(0x1F6E1);  // 🛡
   string e_stock = Emoji(0x1F4B9);   // 💹
   string e_refresh = Emoji(0x1F504); // 🔄
   string e_chart = Emoji(0x1F4CA);   // 📊
   string e_target = Emoji(0x1F3AF); // 🎯
   string e_check = Emoji(0x2705);    // ✅
   string e_clock = Emoji(0x23F0);    // ⏰
   string e_robot = Emoji(0x1F916);   // 🤖
   
   string message = e_shield + " BREAKEVEN ORNATILDI\n" +
                    "====================\n\n" +
                    e_stock + " Juftlik: " + _Symbol + "\n" +
                    e_refresh + " Yonalish: " + tradeType + "\n" +
                    e_chart + " Ochilish: " + DoubleToString(openPrice, (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS)) + "\n" +
                    e_target + " Yangi SL: " + DoubleToString(newSL, (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS)) + "\n\n" +
                    e_check + " Holat: XAVFSIZ ZONA!\n" +
                    "Endi yoqotish bolmaydi\n\n" +
                    "====================\n" +
                    e_clock + " " + TimeToString(TimeCurrent(), TIME_DATE|TIME_SECONDS) + "\n" +
                    e_robot + " FATH Robot v1.6";
   
   SendTelegramMessage(message);
}

//+------------------------------------------------------------------+
//| Stop Loss olinganda xabar yuborish                                |
//+------------------------------------------------------------------+
void SendStopLossNotification(string tradeType, double lot, double openPrice, double slPrice, double loss)
{
   // Tester rejimida ishlamaydi
   if(MQLInfoInteger(MQL_TESTER)) return;
   if(!SendTelegramSignals) return;
   
   string screenshot = TakeChartScreenshot();
   
   // Emojilar
   string e_alert = Emoji(0x1F6A8);   // 🚨
   string e_stock = Emoji(0x1F4B9);   // 💹
   string e_refresh = Emoji(0x1F504); // 🔄
   string e_box = Emoji(0x1F4E6);     // 📦
   string e_chart = Emoji(0x1F4CA);   // 📊
   string e_cross = Emoji(0x274C);    // ❌
   string e_loss = Emoji(0x1F4B8);    // 💸
   string e_warn = Emoji(0x26A0);     // ⚠
   string e_clock = Emoji(0x23F0);    // ⏰
   string e_robot = Emoji(0x1F916);   // 🤖
   
   string message = e_alert + " STOP LOSS URDI\n" +
                    "====================\n\n" +
                    e_stock + " Juftlik: " + _Symbol + "\n" +
                    e_refresh + " Yonalish: " + tradeType + "\n" +
                    e_box + " Hajm: " + DoubleToString(lot, 2) + " lot\n\n" +
                    e_chart + " Ochilish: " + DoubleToString(openPrice, (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS)) + "\n" +
                    e_cross + " Stop Loss: " + DoubleToString(slPrice, (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS)) + "\n\n" +
                    e_loss + " Yoqotish: " + DoubleToString(loss, 2) + " USD\n\n" +
                    "====================\n" +
                    e_warn + " Savdo xavfni boshqarish bilan!\n" +
                    "Kunlik limitni nazorat qiling.\n\n" +
                    e_clock + " " + TimeToString(TimeCurrent(), TIME_DATE|TIME_SECONDS) + "\n" +
                    e_robot + " FATH Robot v1.6";
   
   if(StringLen(screenshot) > 0)
      SendTelegramPhoto(screenshot, message);
   else
      SendTelegramMessage(message);
}

//+------------------------------------------------------------------+
//| Kunlik hisobot yuborish                                           |
//+------------------------------------------------------------------+
void SendDailyReport()
{
   // Tester rejimida ishlamaydi
   if(MQLInfoInteger(MQL_TESTER)) return;
   if(!SendTelegramSignals) return;
   
   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);
   
   // Faqat soat 23:55 da yuborish
   if(dt.hour != 23 || dt.min < 55)
      return;
   
   // Bugun allaqachon yuborilganmi
   datetime todayStart = iTime(_Symbol, PERIOD_D1, 0);
   if(lastDailyReportTime >= todayStart)
      return;
   
   lastDailyReportTime = TimeCurrent();
   
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double winrate = (dailyTrades > 0) ? ((double)dailyWins / dailyTrades * 100) : 0;
   
   // Emojilar
   string e_chart = Emoji(0x1F4CA);    // 📊
   string e_check = Emoji(0x2705);     // ✅
   string e_cross = Emoji(0x274C);     // ❌
   string e_calendar = Emoji(0x1F4C5); // 📅
   string e_up = Emoji(0x1F4C8);       // 📈
   string e_target = Emoji(0x1F3AF);  // 🎯
   string e_brief = Emoji(0x1F4BC);    // 💼
   string e_money = Emoji(0x1F4B0);    // 💰
   string e_loss = Emoji(0x1F4B8);     // 💸
   string e_dollar = Emoji(0x1F4B5);   // 💵
   string e_stock = Emoji(0x1F4B9);    // 💹
   string e_robot = Emoji(0x1F916);    // 🤖
   
   string profit_text = (dailyProfit >= 0) ? "+" + DoubleToString(dailyProfit, 2) : DoubleToString(dailyProfit, 2);
   string result_emoji = (dailyProfit >= 0) ? e_chart + e_check : e_chart + e_cross;
   string money_emoji = (dailyProfit >= 0) ? e_money : e_loss;
   
   string message = result_emoji + " KUNLIK HISOBOT\n" +
                    "====================\n" +
                    e_calendar + " " + TimeToString(TimeCurrent(), TIME_DATE) + "\n\n" +
                    e_up + " SAVDO STATISTIKASI\n" +
                    "- " + e_chart + " Jami bitimlar: " + IntegerToString(dailyTrades) + "\n" +
                    "- " + e_check + " Yutilgan: " + IntegerToString(dailyWins) + "\n" +
                    "- " + e_cross + " Yoqotilgan: " + IntegerToString(dailyLosses) + "\n" +
                    "- " + e_target + " Win Rate: " + DoubleToString(winrate, 1) + "%\n\n" +
                    e_brief + " MOLIYAVIY NATIJA\n" +
                    "- " + money_emoji + " Kunlik: " + profit_text + " USD\n" +
                    "- " + e_dollar + " Balans: " + DoubleToString(balance, 2) + " USD\n" +
                    "- " + e_chart + " Equity: " + DoubleToString(equity, 2) + " USD\n\n" +
                    "====================\n" +
                    e_stock + " Symbol: " + _Symbol + "\n" +
                    e_robot + " FATH Robot v1.6";
   
   string screenshot = TakeChartScreenshot();
   if(StringLen(screenshot) > 0)
      SendTelegramPhoto(screenshot, message);
   else
      SendTelegramMessage(message);
   
   // Kunlik statistikani reset qilish
   dailyProfit = 0;
   dailyTrades = 0;
   dailyWins = 0;
   dailyLosses = 0;
}

//+------------------------------------------------------------------+
//| Yopilgan bitimlarni tekshirish va xabar yuborish                  |
//+------------------------------------------------------------------+
void CheckClosedTrades()
{
   // Tester rejimida ishlamaydi
   if(MQLInfoInteger(MQL_TESTER)) return;
   if(!SendTelegramSignals && !EnableSiteTradeSync) return;
   
   // So'nggi 1 kun ichidagi bitimlarni tekshirish
   datetime from_time = TimeCurrent() - 86400;
   HistorySelect(from_time, TimeCurrent());
   
   int deals = HistoryDealsTotal();
   
   for(int i = deals - 1; i >= 0; i--)
   {
      ulong ticket = HistoryDealGetTicket(i);
      
      if(ticket <= lastProcessedTicket)
         break; // Allaqachon qayta ishlangan
      
      string symbol = HistoryDealGetString(ticket, DEAL_SYMBOL);
      if(symbol != _Symbol)
         continue;
      
      // Magic Number tekshirish - faqat bizning bitimlarimiz
      long deal_magic = HistoryDealGetInteger(ticket, DEAL_MAGIC);
      if(deal_magic != MagicNumber)
         continue;
      
      ENUM_DEAL_ENTRY entry = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(ticket, DEAL_ENTRY);
      if(entry != DEAL_ENTRY_OUT)
         continue; // Faqat yopilgan bitimlar
      
      ENUM_DEAL_TYPE type = (ENUM_DEAL_TYPE)HistoryDealGetInteger(ticket, DEAL_TYPE);
      double profit = HistoryDealGetDouble(ticket, DEAL_PROFIT);
      double lot = HistoryDealGetDouble(ticket, DEAL_VOLUME);
      double price = HistoryDealGetDouble(ticket, DEAL_PRICE);
      double commission = HistoryDealGetDouble(ticket, DEAL_COMMISSION);
      double swap = HistoryDealGetDouble(ticket, DEAL_SWAP);
      datetime closed_time = (datetime)HistoryDealGetInteger(ticket, DEAL_TIME);
      
      // Ochilish narxini topish
      ulong position_id = HistoryDealGetInteger(ticket, DEAL_POSITION_ID);
      double open_price = 0;
      datetime opened_time = closed_time;
      
      for(int j = 0; j < deals; j++)
      {
         ulong t = HistoryDealGetTicket(j);
         if(HistoryDealGetInteger(t, DEAL_POSITION_ID) == position_id &&
            (ENUM_DEAL_ENTRY)HistoryDealGetInteger(t, DEAL_ENTRY) == DEAL_ENTRY_IN)
         {
            open_price = HistoryDealGetDouble(t, DEAL_PRICE);
            opened_time = (datetime)HistoryDealGetInteger(t, DEAL_TIME);
            break;
         }
      }
      
      string trade_type = (type == DEAL_TYPE_BUY) ? "SELL" : "BUY"; // Yopish teskari
      
      // Xabar yuborish
      ENUM_DEAL_REASON reason = (ENUM_DEAL_REASON)HistoryDealGetInteger(ticket, DEAL_REASON);
      if(SendTelegramSignals && reason == DEAL_REASON_SL)
      {
         SendStopLossNotification(trade_type, lot, open_price, price, profit);
      }
      else if(SendTelegramSignals)
      {
         SendTradeCloseSignal(trade_type, lot, open_price, price, profit);
      }

      if(EnableSiteTradeSync && ticket > lastSyncedTradeTicket)
      {
         bool synced = SendTradeResultToSite(
            ticket,
            symbol,
            trade_type,
            lot,
            profit,
            open_price,
            price,
            commission,
            swap,
            opened_time,
            closed_time
         );

         if(synced)
            lastSyncedTradeTicket = ticket;
      }
      
      if(ticket > lastProcessedTicket)
         lastProcessedTicket = ticket;
   }
}









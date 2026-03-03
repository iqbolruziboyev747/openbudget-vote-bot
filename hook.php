<?php

/*uopz_allow_exit(true);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
ini_set("error_log", "php-error.log");
error_reporting(E_ALL);*/

date_default_timezone_set('Asia/Tashkent');

$owners = explode('|', file_get_contents('data/owners.dat'));
$application = file_get_contents('data/porjectid.dat');
$description = file_get_contents('data/description.dat');
$vote_payment = intval(file_get_contents('data/vote_payment.dat'));
$ref_payment = intval(file_get_contents('data/ref_payment.dat'));

include 'Telegram.php';
include 'functions.php';

$tg = new Telegram([
	'token' => "8685209122:AAHIgOnnqztQP3Z5uEZIm5OYnfMobK_ZtZY"
]);


$updates = $tg->get_webhookUpdates();

$startMessage = function($message = ""){
    global $owners, $tg, $description;

    setUserConfig( $tg->get_chatId(), 'lastmessage', '/start' );

    if( empty( $message ) ){
    	$message = "{$description}\n\n<b>Ovoz berish uchun telefon raqamingizni yuboring.</b>\n\nNamuna: <em>919992543</em>";
    }

	$buttons = [
			
	];
	if ( in_array( $tg->get_chatId(), $owners ) )  {
		$buttons[] = [ '🗣 Ovozlar', '🏦 Murojaatlar' ];
		$buttons[] = [ '📝 Matn', '🗄 Loyiha' ];
		$buttons[] = [ '💴 Ovoz berish', '💶 Referal' ];
		$buttons[] = [ '✍️ Bildirishnoma' , '🟢 Holat'];
		$buttons[] = [ '📁 Excel' , '🗑 Tozalash'];
		$buttons[] = [ '👨‍👩‍👧 Foydalanuvchilar', '👨‍💻 Adminlar'];
	}else{
		$buttons[] = [
                [
                    'text' => '📲 Telefon raqamni yuborish',
                    'request_contact' => true
                ]
            ];
		$buttons[] = [ '💳 Hisobim', '🔄 Pul yechib olish', ];
		$buttons[] = [ '🔗 Referal' ];
	}
	$tg->send_chatAction('typing')
		->set_replyKeyboard($buttons)
		->send_message( $message );
};

$apiValidatePhone = function( $phone ){
    global $owners, $tg, $application;
    
    if (check_phonenumber($phone)) {
    	$message = "⚠️ Bu raqam avval ovoz berish uchun ishlatilgan";
    	$tg->send_chatAction('typing')->send_message( $message );
    	exit;
    }

    $data = api('user/validate_phone/', [
		'phone' => $phone,
		'application' => $application,
	]);

	if ( $data['code'] == 200 && !empty( $data['data']['token'] ) ) {
		setUserConfig( $tg->get_chatId(), 'phone', $phone );
		setUserConfig( $tg->get_chatId(), 'token', $data['data']['token'] );
		setUserConfig( $tg->get_chatId(), 'token_expire', time() );
		setUserConfig( $tg->get_chatId(), 'lastmessage', 'validateotp' );
		$tg->set_replyKeyboard([
			['❌ Bekor qilish']
		]);
		$message = "⏳ Iltimos sms orqali yuborilgan kodni kiriting";
	}else if ( $data['code'] == 400 && $data['data']['detail'] == "This number was used to vote" ) {
		$message = "⚠️ Bu raqam avval ovoz berish uchun ishlatilgan";
	}else{
		$approximate_time = "";
		if ( !empty( $data['data']['detail'] ) ) {
			preg_match('/Expected available in (\d+) seconds./', $data['data']['detail'], $matches);
			if (!empty($matches[1])) {
				$approximate_time = ". Taxminiy vaqt: ".date("Y-m-d | H:i:s", ( time() + intval( $matches[1] ) ) );
			}
		}
		$message = "⚠️ Opendudget saytida yuklama oshganligi sababli ulanishlarda xatolik yuz berdi. Iltimos keyinroq ovoz berishga qaytadan urinib ko'ring" . $approximate_time;
	}
	
	$tg->send_chatAction('typing')->send_message( $message );
};

$applicationMessage = function(){
    global $tg, $config;
    $applications = get_applications();
    $applications_count = count($applications);
    if ( $applications_count == 0 ) {
        $tg->send_chatAction('typing')->send_message( '❌ Murojaatlar mavjud emas' );
        exit(1);
    }

    $application = application( $applications[0], $applications_count);
    $pagination = getPagination($applications[0]['time'], 0, $applications_count, 'app');
    array_unshift($pagination , [
        [
            'text' => '✅ Bajarildi',
            'callback_data' => 'app_s='.$applications[0]['chat_id']
        ],
    ]);
    $tg->send_chatAction('typing')->set_inlineKeyboard($pagination)->send_message( $application );
};

$statusMessages = function(){
    global $tg, $config;
    
    $count_notifications = message_status('count');
    $status = (message_status() == 'on') ? '🟢' : '🔴';
    $tg->send_chatAction('typing')->set_inlineKeyboard([
        [
            [
                "text" => "🟢",
                "callback_data" => "status=on"
            ],
            [
                "text" => "🔄",
                "callback_data" => "status=check"
            ],
            [
                "text" => "🔴",
                "callback_data" => "status=off"
            ]
        ],
        [
            [
                "text" => "🗑 Tozalash",
                "callback_data" => "clear=true"
            ]
        ],
    ])->send_message( "Bildirishnoma yuborish holati: {$status}\n\n⏳ Jarayondagi xabarlar: {$count_notifications}");
    
};

if (! empty( $updates ) ) {
	if (!empty($updates['message']['chat']['id'])) {
		$tg->set_chatId( $updates['message']['chat']['id'] );
	}

	if( ! empty( $updates['message']['text'] ) || $updates['message']['text'] == "0" ){
		
		$text = $updates['message']['text'];

		if (!empty( $updates['message']['chat']['first_name'] )){
			setUserConfig( $tg->get_chatId(), 'first_name', $updates['message']['chat']['first_name'] );
		}else{
			setUserConfig( $tg->get_chatId(), 'first_name', '');
		}
		if (!empty( $updates['message']['chat']['last_name'] )){
			setUserConfig( $tg->get_chatId(), 'last_name', $updates['message']['chat']['last_name'] );
		}else{
			setUserConfig( $tg->get_chatId(), 'last_name', '');
		}
		if (!empty( $updates['message']['chat']['username'] )){
			setUserConfig( $tg->get_chatId(), 'username', $updates['message']['chat']['username'] );
		}else{
			setUserConfig( $tg->get_chatId(), 'username', '');
		}

 		setUserConfig( $tg->get_chatId(), 'lastaction', time() );

 		if (preg_match('/\/start (\d+)/', $text, $refmatches)) {
			if ($refmatches[1] != $tg->get_chatId() && !file_exists('referals/'.$tg->get_chatId())) {
				
				$uc = getUserConfig( $refmatches[1], 'balance');
				if (empty($uc)) $uc = "0";
				setUserConfig( $refmatches[1], 'balance', strval( intval( $uc ) + $ref_payment ) );

				$ref = getUserConfig( $refmatches[1], 'referals');
				if (empty($ref)) $ref = "0";
				setUserConfig( $refmatches[1], 'referals', strval( intval( $ref ) + 1 ) );
				file_put_contents('referals/'.$tg->get_chatId(), $refmatches[1]);
				$tg->send_chatAction('typing', $refmatches[1])->send_message( "ℹ️ Sizda yangi referal mavjud", $refmatches[1]  );
			}
			$startMessage();
		}else if ($text == '/start' || $text == '/asosiy') {
			$startMessage();
		}else if (in_array( $tg->get_chatId(), $owners ) && $text == '🔙 Orqaga' ) {
			$startMessage("👉 Asosiy menyu");
		}else if (in_array( $tg->get_chatId(), $owners ) && $text == '👨‍💻 Adminlar' ) {
            $owners_count = count($owners);
			if ( $owners_count == 0 ) {
				$tg->send_chatAction('typing')->send_message( '⚠️ Adminlar mavjud emas' );
				exit(1);
			}
			$user = json_decode( file_get_contents( 'users/'.$owners[0].'.json' ), TRUE );
			$user['id'] = $owners[0];
			$owner = owner($user , $owners_count);
			$pagination = getPagination($owners[0], 0, $owners_count, 'owner');
			array_unshift($pagination , [
                [
		            'text' => '➕ Qo‘shish',
		            'callback_data' => 'addowner=yes'
		        ],
		        [
		            'text' => '🗑 O‘chirish',
		            'callback_data' => 'removeowner='.$user['id']
		        ],
            ]);
			$tg->send_chatAction('typing')->set_inlineKeyboard($pagination)->send_message( $owner );
        }else if (in_array( $tg->get_chatId(), $owners ) && $text == '🟢 Holat' ) {
            $statusMessages();
        }else if (in_array( $tg->get_chatId(), $owners ) && $text == '✍️ Bildirishnoma' ) {
            setUserConfig($tg->get_chatId(), 'lastmessage', 'send_notification');
            $tg->send_chatAction('typing')->set_replyKeyboard([
                ['🔙 Orqaga'],
            ])->send_message("📢 Foydalanuvchilarga bildirishnoma yuborish uchun quyida xabarni kiriting...");
        }else if (in_array( $tg->get_chatId(), $owners ) && getUserConfig($tg->get_chatId(), 'lastmessage') == 'send_notification' ) {
            if ( strlen( $text ) > 10) {
                add_notifications([
                    'text' => $text
                ]);
                $startMessage("✅ Foydalanuvchilarga bildirishnoma yuborish jarayoni boshlandi");
            }else{
                $tg->send_chatAction('typing')->send_message( "<em>🛑 Kechirasiz, bildirishnoma matni 10 dona belgidan kam bo'lmasligi lozim.</em>" );   
            }
        }else if (in_array( $tg->get_chatId(), $owners ) && getUserConfig($tg->get_chatId(), 'lastmessage') == 'clear_notification' ) {
            if ($text == '👍 Ha') {
                clear_notification();
                $startMessage("✅ Jarayondagi bildirishnomalar muvaffaqiyatli tozalandi.");
            }else{
                $startMessage("Asosiy menyu 👇");
            }
        }else if (in_array( $tg->get_chatId(), $owners ) && $text == '📁 Excel' ) {
			//$tg->send_message(get_url());
			$tg->send_message( "Excel faylni yuklash uchun shuyerga bosing:\n".get_url().'excel.php' );
		}else if (in_array( $tg->get_chatId(), $owners ) && $text == '🗑 Tozalash' ) {
			$tg->send_chatAction('typing')->set_inlineKeyboard([
        		[
            		[
               	 		"text" => "✅ Tozalash",
                		"callback_data" => "clearvote=yes"
            		]
        		]
    		])->send_message( "Siz chindan ham ovozlarni tozalamoqchimisiz?" );
		}else if (in_array( $tg->get_chatId(), $owners ) && $text == '👨‍👩‍👧 Foydalanuvchilar' ) {
			$users = get_users();
			$users_count = count($users);
			if ( $users_count == 0 ) {
				$tg->send_chatAction('typing')->send_message( '⚠️ Foydalanuvchilar mavjud emas' );
				exit(1);
			}
			$user = user( $users[0], $users_count);
			$pagination = getPagination($users[0]['id'], 0, $users_count, 'users');
			$tg->send_chatAction('typing')->set_inlineKeyboard($pagination)->send_message( $user );
		}else if (in_array( $tg->get_chatId(), $owners ) && $text == '🗣 Ovozlar' ) {
			$votes = get_votes();
			$votes_count = count($votes);
			if ( $votes_count == 0 ) {
				$tg->send_chatAction('typing')->send_message( '⚠️ Ovozlar mavjud emas' );
				exit(1);
			}
			$vote = vote( $votes[0], $votes_count);
			$pagination = getPagination($votes[0]['time'], 0, $votes_count, 'votes');
			$tg->send_chatAction('typing')->set_inlineKeyboard($pagination)->send_message( $vote );
		}else if (in_array( $tg->get_chatId(), $owners ) && $text == '🏦 Murojaatlar' ) {
			$applicationMessage();
		}else if (in_array( $tg->get_chatId(), $owners ) && $text == '🗄 Loyiha' ) {
			setUserConfig( $tg->get_chatId(), 'lastmessage', 'porjectid' );
			$tg->send_chatAction('typing')->set_replyKeyboard([
				['🔙 Orqaga']
			])->send_message( "🆔 Iltimos loyiha idenfikatori kiriting\n\n👉 Joriy idenfikator: " . $application );
		}else if (in_array( $tg->get_chatId(), $owners ) && $text == '📝 Matn' ) {
			setUserConfig( $tg->get_chatId(), 'lastmessage', 'description' );
			$tg->send_chatAction('typing')->set_replyKeyboard([
				['🔙 Orqaga']
			])->send_message( "💬 Iltimos loyiha tavsifini kiriting\n\n👉 Joriy matn: " . $description );
		}else if (in_array( $tg->get_chatId(), $owners ) && $text == '💴 Ovoz berish' ) {
			setUserConfig( $tg->get_chatId(), 'lastmessage', 'vote_payment' );
			$tg->send_chatAction('typing')->set_replyKeyboard([
				['🔙 Orqaga']
			])->send_message( "💴 Iltimos har bir ovoz summasini kiriting\n\n👉 Joriy summa: " . $vote_payment );
		}else if (in_array( $tg->get_chatId(), $owners ) && $text == '💶 Referal' ) {
			setUserConfig( $tg->get_chatId(), 'lastmessage', 'ref_payment' );
			$tg->send_chatAction('typing')->set_replyKeyboard([
				['🔙 Orqaga']
			])->send_message( "💴 Iltimos har bir referal summasini kiriting\n\n👉 Joriy summa: " . $ref_payment );
		}else if (in_array( $tg->get_chatId(), $owners ) && getUserConfig( $tg->get_chatId(), 'lastmessage') == 'porjectid' ) {
			file_put_contents('data/porjectid.dat', $text);
			$startMessage("ℹ️ Ma'lumot muvaffaqiyatli yangilandi");
		}else if (in_array( $tg->get_chatId(), $owners ) && getUserConfig( $tg->get_chatId(), 'lastmessage') == 'description' ) {
			file_put_contents('data/description.dat', $text);
			$startMessage("ℹ️ Ma'lumot muvaffaqiyatli yangilandi");
		}else if (in_array( $tg->get_chatId(), $owners ) && getUserConfig( $tg->get_chatId(), 'lastmessage') == 'vote_payment' ) {
			file_put_contents('data/vote_payment.dat', strval( $text ));
			$startMessage("ℹ️ Ma'lumot muvaffaqiyatli yangilandi");
		}else if (in_array( $tg->get_chatId(), $owners ) && getUserConfig( $tg->get_chatId(), 'lastmessage') == 'ref_payment' ) {
			file_put_contents('data/ref_payment.dat', strval( $text ));
			$startMessage("ℹ️ Ma'lumot muvaffaqiyatli yangilandi");
		}else if (in_array( $tg->get_chatId(), $owners ) && getUserConfig( $tg->get_chatId(), 'lastmessage') == 'addowner' ) {
			$id = clear_phone($text);
			$owners[] = $id;
			file_put_contents('data/owners.dat', implode("|", $owners));
			$startMessage("ℹ️ Admin muvaffaqiyatli qo'shildi");
		}else if ($text == '/bekor' || $text == '❌ Bekor qilish') {
			$startMessage("ℹ️ Jarayon bekor qilindi");
		}else if ($text == '/hisobim' || $text == '💳 Hisobim') {
			$uc = getUserConfig( $tg->get_chatId(), 'balance');
			if (empty($uc)) $uc = "0";

			$tg->send_chatAction('typing')->send_message( "💰 Hisobda <b>{$uc} so'm</b> mavjud" );
		}else if ($text == '/uc_yechish' || $text == '🔄 Pul yechib olish') {
			setUserConfig( $tg->get_chatId(), 'lastmessage', 'exchange' );
			$tg->send_chatAction('typing')->set_replyKeyboard([
				['❌ Bekor qilish']
			])->send_message( "👉 <b>Pul</b> yechib olish uchun iltimos <b>Telefon yoki Karta </b> raqamni kiriting.\n\n<em>ℹ️ Minimal pul yechish miqdori: 10 000 so'm</em>" );
		}else if ($text == '/referal' || $text == '🔗 Referal') {
			$ref = getUserConfig( $tg->get_chatId(), 'referals');
			if (empty($ref)) $ref = "0";
			$tg->send_chatAction('typing')->send_message( "ℹ️ Referal manzil orqali do'stlaringizni botga taklif qiling va \"pul\" ishlab toping. Har bir referal uchun {$ref_payment} so'mdan taqdim etiladi.\n\n👨‍👩‍👦Referal orqali qo'shilganlar: {$ref} dona \n\nSizning referal manzilingiz 👇\n\nhttps://t.me/obudgetbot?start=".$tg->get_chatId()  );
		}else if ($text == '/haqida' || $text == '🤖 Bot haqida') {
			$tg->send_chatAction('typing')->send_message( "👨‍💻 Dasturchi: Manuchehr Usmonov\n🌐 Veb-sayt: https://manu.uno/"  );
		}else if( getUserConfig( $tg->get_chatId(), 'lastmessage') == 'exchange' ){
			$uc = getUserConfig( $tg->get_chatId(), 'balance');
			if (empty($uc)) $uc = 0;
			if ( intval( $uc ) < 10000 ) {
				$startMessage("⚠️ Kechirasiz, ayriboshlash uchun hisob yetarli emas.\n\n<em>ℹ️ Minimal pul yechish miqdori: 10 000 so'm</em>");
				exit();
			}

			$status = addRequest([
                'chat_id' => $tg->get_chatId(),
                'time' => time(),
                'text' => clear_phone( $text )
            ]);
            if ($status) {
            	$startMessage("✅ Pul yechib olish uchun so'rov muvaffaqiyatli yuborildi");
            }else{
            	$startMessage("⏳ Kechirasiz sizda avvalroq yuborilgan so'rov mavjud. Iltimos, jarayon yakunlanishini kuting.");
            }
		}else if( getUserConfig( $tg->get_chatId(), 'lastmessage') == 'validateotp' ){
			
			$phone = getUserConfig( $tg->get_chatId(), 'phone');
			$token = getUserConfig( $tg->get_chatId(), 'token');
			$token_expire = intval( getUserConfig( $tg->get_chatId(), 'token_expire') );

			if ( $token_expire > ( time() -  180) ) {
				$data = api('user/temp/vote/', [
					'phone' => $phone,
					'token' => $token,
					'otp' => $text,
					'application' => $application,
				]);
				//$tg->send_chatAction('typing')->send_message( print_r($data, TRUE) );
				if ($data['code'] == 200) {
					$uc = getUserConfig( $tg->get_chatId(), 'balance');
					if (empty($uc)) $uc = "0";
					$newbalance = strval( intval( $uc ) + $vote_payment );
					setUserConfig( $tg->get_chatId(), 'balance',  $newbalance);

					$votes = getUserConfig( $tg->get_chatId(), 'votes');
					if (empty($votes)) $votes = "0";
					setUserConfig( $tg->get_chatId(), 'votes', strval( intval( $votes ) + 1 ) );

					add_vote([
						'time' => time(),
						'chat_id' => $tg->get_chatId(),
						'phone' => $phone
					]);
					//$startMessage("✅ <b>Tabriklaymiz, siz {$vote_payment} so'mga ega bo'ldingiz.</b>\n\nAsosiy menyudagi \"Hisobim\" bo'limi orqali balansingizni tekshiringiz mumkin.");
					$startMessage("✅ Ovoz qabul qilindi.\nHisobdagi mablag': <b>{$newbalance} so'm</b>\n\n👉 Ovoz berib pul ishlashda davom etish uchun telefon raqam kiring...");
				}else if ($data['code'] == 400 && !empty( $data['data']['detail'] )  && $data['data']['detail'] == "Invalid code") {
					$tg->send_chatAction('typing')->send_message( "❌ Tasdiqlash kodi xato kiritildi" );
				}else{
					$approximate_time = "";
					if ( !empty( $data['data']['detail'] ) ) {
						preg_match('/Expected available in (\d+) seconds./', $data['data']['detail'], $matches);
						if (!empty($matches[1])) {
							$approximate_time = ". Taxminiy vaqt: ".date("Y-m-d | H:i:s", ( time() + intval( $matches[1] ) ) );
						}
					}
					$startMessage("❌ Opendudget saytida yuklama oshganligi sababli ulanishlarda xatolik yuz berdi. Iltimos keyinroq ovoz berishga qaytadan urinib ko'ring" . $approximate_time);
				}
			}else{
				$startMessage("🚫 Tasdiqlash kodini kiritish vaqti tugagan. Iltimos qaytadan so'rov yuboring");
			}
			//$startMessage("✅ Loyihaga ovoz berganingiz uchun rahmat");
		}else if ( preg_match('/^[+]?998/', $text) || strlen( $text ) == 9 ) {
			if (strlen( $text ) == 9) {
				$text = "998".$text;
			}

			if ( validate_phone( clear_phone( $text ) ) ) {
			
				$apiValidatePhone( clear_phone( $text ) );
			
			}else{
				$tg->send_chatAction('typing')->send_message( "⚠️ Kechirasiz telefon raqam formati mos emas yoki raqam O'zbekiston hududidan tashqarida" );
			}
		
		}else{
			$tg->send_chatAction('typing')->send_message( "Kechirasiz men sizni tushuna olmadim 🤷‍♂️" );
		}
	}

	if( ! empty( $updates['message']['contact'] ) ){
		$phone = clear_phone( $updates['message']['contact']['phone_number'] );
		if ( validate_phone( $phone ) ) {
			
			$apiValidatePhone( $phone );
		
		}else{
			$tg->send_chatAction('typing')->send_message( "⚠️ Kechirasiz telefon raqam formati mos emas yoki raqam O'zbekiston hududidan tashqarida" );
		}
	}

	if( ! empty( $updates['message']['photo'] ) ){
        if (in_array( $tg->get_chatId(), $owners ) && getUserConfig($tg->get_chatId(), 'lastmessage') == 'send_notification' ) {
            $photo = end($updates['message']['photo']);
            $caption = (!empty($updates['message']['caption'])) ? $updates['message']['caption'] : '';
            add_notifications([
                'photo' => $photo['file_id'],
                'caption' => $caption
            ]);
            $startMessage("✅ Foydalanuvchilarga bildirishnoma yuborish jarayoni boshlandi");
        }
    }

    if( ! empty( $updates['message']['video'] ) ){
        if (in_array( $tg->get_chatId(), $owners ) && getUserConfig($tg->get_chatId(), 'lastmessage') == 'send_notification' ) {
            $video = $updates['message']['video']['file_id'];
            $caption = (!empty($updates['message']['caption'])) ? $updates['message']['caption'] : '';
            add_notifications([
                'video' => $video,
                'caption' => $caption
            ]);
            $startMessage("✅ Foydalanuvchilarga bildirishnoma yuborish jarayoni boshlandi");
        }
    }

	if( ! empty( $updates['callback_query']['data'] ) ){
		$tg->set_chatId($updates['callback_query']['message']['chat']['id']);
		parse_str($updates['callback_query']['data'], $query);
		if (count($query) > 0) {

			if ( ! empty( $query['status'] ) ) {
                if (in_array($query['status'], ['on', 'off'])) {
                    message_status($query['status']);
                    $count_notifications = message_status('count');
                    $status = (message_status() == 'on') ? '🟢' : '🔴';
                    $req = $tg->request('editMessageText', [
                        'chat_id' => $updates['callback_query']['message']['chat']['id'],
                        'message_id' => $updates['callback_query']['message']['message_id'],
                        'reply_markup' => $updates['callback_query']['message']['reply_markup'],
                        'text' => "Bildirishnoma yuborish holati: {$status}\n\n⏳ Jarayondagi xabarlar: {$count_notifications}",
                        'parse_mode' => 'html',
                        'disable_web_page_preview' => true
                    ]);
                    $tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => "Holat o'zgartirildi"]);
                }elseif ($query['status'] == 'check') {
                    $count_notifications = message_status('count');
                    $status = (message_status() == 'on') ? '🟢' : '🔴';
                    $req = $tg->request('editMessageText', [
                        'chat_id' => $updates['callback_query']['message']['chat']['id'],
                        'message_id' => $updates['callback_query']['message']['message_id'],
                        'reply_markup' => $updates['callback_query']['message']['reply_markup'],
                        'text' => "Bildirishnoma yuborish holati: {$status}\n\n⏳ Jarayondagi xabarlar: {$count_notifications}",
                        'parse_mode' => 'html',
                        'disable_web_page_preview' => true
                    ]);
                    $tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => "Natija yangilandi"]);
                }else{
                    $tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => "⚠️ Tizimda xatolik yuzberdi", 'show_alert' => true]);
                }
            }
            if ( ! empty( $query['clear'] ) ) {
                if ($query['clear'] == 'true') {
                    setUserConfig($tg->get_chatId(), 'lastmessage', 'clear_notification');
                    $tg->send_chatAction('typing')->set_replyKeyboard([
                        ['👍 Ha', '🙅‍♂️ Yo‘q'],
                        ['🔙 Orqaga'],
                    ])->send_message("⚠️ Siz chindan ham jarayondagi bildirishnomalarni o'chirmoqchimisiz?");
                    $tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => "Variantlardan birini tanlang"]);
                }else{
                    $tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => "⚠️ Tizimda xatolik yuzberdi", 'show_alert' => true]);
                }
            }

            if ( ! empty( $query['addowner'] ) ) {
                setUserConfig($tg->get_chatId(), 'lastmessage', 'addowner');
                $tg->request('deleteMessage', ['chat_id' => $updates['callback_query']['message']['chat']['id'], 'message_id' => $updates['callback_query']['message']['message_id']]);
                $tg->send_chatAction('typing')->set_replyKeyboard([
                    ['🔙 Orqaga'],
                ])->send_message("🆔 Admin qo'shish uchun idenfikator kiriting");
                $tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => "Ma'lumotni kiriting"]);
            }

            if ( ! empty( $query['removeowner'] ) ) {
                $id = $query['removeowner'];
                $temp_owners = [];
                foreach ($owners as $owner) {
                	if ($owner != $id) {
                		$temp_owners[] = $owner;
                	}
                }
                file_put_contents('data/owners.dat', implode("|", $temp_owners));
                $tg->request('deleteMessage', ['chat_id' => $updates['callback_query']['message']['chat']['id'], 'message_id' => $updates['callback_query']['message']['message_id']]);
                $tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => "Admin o'chirildi"]);
                $startMessage("✅ Admin o'chirildi");
            }

            if ( ! empty( $query['clearvote'] ) ) {
            	clear_votes();
                $tg->request('deleteMessage', ['chat_id' => $updates['callback_query']['message']['chat']['id'], 'message_id' => $updates['callback_query']['message']['message_id']]);
                $tg->send_chatAction('typing')->send_message("Ma'lumotlar o'chirildi");
                $tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => "Ma'lumotlar tozalandi"]);
            }

            if ( ! empty( $query['owner'] ) ) {
				$owners_count = count($owners);
				if ( $owners_count == 0 ) {
					$tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => "❌ Foydalanuvchilar mavjud emas"]);
					exit(1);
				}
				$page = ( array_key_exists('prev', $query) ) ? intval($query['prev']) : intval($query['next']);
				$owner = array_slice($owners, $page, 1, true);
                if (count($owner) > 0) {
                	$owner = reset($owner);
                	$user = json_decode( file_get_contents( 'users/'.$owner.'.json' ), TRUE );
					$user['id'] = $owner;
					$message = owner($user , $owners_count);
					$pagination = getPagination($owner, $page, $owners_count, 'owner');
					array_unshift($pagination , [
		                [
				            'text' => '➕ Qo‘shish',
				            'callback_data' => 'addowner=yes'
				        ],
				        [
				            'text' => '🗑 O‘chirish',
				            'callback_data' => 'removeowner='.$user['id']
				        ],
		            ]);
					$req = $tg->request('editMessageText', [
                    	'chat_id' => $updates['callback_query']['message']['chat']['id'],
                        'message_id' => $updates['callback_query']['message']['message_id'],
                        'reply_markup' => [
                        	'inline_keyboard' => $pagination
                        ],
                        'text' => $message,
                        'parse_mode' => 'html',
                        'disable_web_page_preview' => true
                    ]);
					$tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => "Natija yangilandi"]);
                }else{
                	$tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => "Natijalar topilmadi"]);
                }
			}


			if ( ! empty( $query['users'] ) ) {
				$users = get_users();
				$users_count = count($users);
				if ( $users_count == 0 ) {
					$tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => "❌ Foydalanuvchilar mavjud emas"]);
					exit(1);
				}
				$page = ( array_key_exists('prev', $query) ) ? intval($query['prev']) : intval($query['next']);
				$user = array_slice($users, $page, 1, true);
                if (count($user) > 0) {
                	$user = reset($user);
                	
                	$message = user( $user, $users_count);
					$pagination = getPagination($user['id'], $page, $users_count, 'users');
					$req = $tg->request('editMessageText', [
                    	'chat_id' => $updates['callback_query']['message']['chat']['id'],
                        'message_id' => $updates['callback_query']['message']['message_id'],
                        'reply_markup' => [
                        	'inline_keyboard' => $pagination
                        ],
                        'text' => $message,
                        'parse_mode' => 'html',
                        'disable_web_page_preview' => true
                    ]);
					$tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => "Natija yangilandi"]);
                }else{
                	$tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => "Natijalar topilmadi"]);
                }
			}

			if ( ! empty( $query['votes'] ) ) {
				$votes = get_votes();
				$votes_count = count($votes);
				if ( $votes_count == 0 ) {
					$tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => "❌ Foydalanuvchilar mavjud emas"]);
					exit(1);
				}
				$page = ( array_key_exists('prev', $query) ) ? intval($query['prev']) : intval($query['next']);
				$vote = array_slice($votes, $page, 1, true);
                if (count($vote) > 0) {
                	$vote = reset($vote);
                	
                	$message = vote( $vote, $votes_count);
					$pagination = getPagination($vote['time'], $page, $votes_count, 'votes');
					$req = $tg->request('editMessageText', [
                    	'chat_id' => $updates['callback_query']['message']['chat']['id'],
                        'message_id' => $updates['callback_query']['message']['message_id'],
                        'reply_markup' => [
                        	'inline_keyboard' => $pagination
                        ],
                        'text' => $message,
                        'parse_mode' => 'html',
                        'disable_web_page_preview' => true
                    ]);
					$tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => "Natija yangilandi"]);
                }else{
                	$tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => "Natijalar topilmadi"]);
                }
			}

			if ( ! empty( $query['app'] ) ) {
                $applications = get_applications();
                $applications_count = count($applications);
                if ( $applications_count == 0 ) {
                    $tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => '❌ Murojaatlar mavjud emas']);
                    exit(1);
                }
                $page = ( array_key_exists('prev', $query) ) ? intval($query['prev']) : intval($query['next']);
                $application = array_slice($applications, $page, 1, true);
                if (count($application) > 0) {
                    $application = reset($application);
                    
                    $message = application( $application, $applications_count);
                    $pagination = getPagination($application['chat_id'], $page, $applications_count, 'app');
                    array_unshift($pagination , [
                        [
				            'text' => '✅ Bajarildi',
				            'callback_data' => 'app_s='.$application['chat_id']
				        ],
                    ]);
                    $req = $tg->request('editMessageText', [
                        'chat_id' => $updates['callback_query']['message']['chat']['id'],
                        'message_id' => $updates['callback_query']['message']['message_id'],
                        'reply_markup' => [
                            'inline_keyboard' => $pagination
                        ],
                        'text' => $message,
                        'parse_mode' => 'html',
                        'disable_web_page_preview' => true
                    ]);
                    $tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => 'Natija yangilandi']);
                }else{
                    $tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => 'Natijalar topilmadi']);
                }
            }

            if ( ! empty( $query['app_s'] ) ) {
            	setUserConfig( $query['app_s'], 'balance', "0" );
            	@unlink('requests/' . $query['app_s'].'.json');
            	$tg->send_message( "✅ Pul ayriboshlash muvaffaqiyatli amalga oshirildi", $query['app_s'] );
            	$tg->request('answerCallbackQuery', ['callback_query_id' => $updates['callback_query']['id'], 'text' => "✅ Harakat muvaffaqiyatli bajarildi", 'show_alert' => true]);
            	$tg->request('deleteMessage', ['chat_id' => $updates['callback_query']['message']['chat']['id'], 'message_id' => $updates['callback_query']['message']['message_id']]);
            	$applicationMessage();
            }
		}
	}
}
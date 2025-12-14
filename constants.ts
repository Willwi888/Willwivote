
import { Song, Language, SocialLink } from './types';

export const getAudioUrl = (source: string) => {
    if (!source) return '';
    
    let finalUrl = source.trim();

    // --- FOLDER LINK DETECTION ---
    if (finalUrl.includes('/folders/') || finalUrl.includes('/drive/folders/') || finalUrl.includes('/fo/') || finalUrl.includes('/sh/')) {
        return finalUrl;
    }

    // --- DROPBOX ULTIMATE FIX (Stability Edition) ---
    if (finalUrl.includes('dropbox.com') || finalUrl.includes('dropboxusercontent.com')) {
        // Force www.dropbox.com for consistent API handling
        finalUrl = finalUrl.replace(/^(https?:\/\/)?(dl\.dropboxusercontent\.com|www\.dropbox\.com)/, '$1www.dropbox.com');
        
        // Clean URL params to ensure we get a fresh stream link
        if (finalUrl.includes('dl=0')) {
            finalUrl = finalUrl.replace('dl=0', 'raw=1');
        } else if (finalUrl.includes('dl=1')) {
            finalUrl = finalUrl.replace('dl=1', 'raw=1');
        } else if (!finalUrl.includes('raw=')) {
            // Append raw=1, handling existing query params
            finalUrl = finalUrl + (finalUrl.includes('?') ? '&raw=1' : '?raw=1');
        }
        return finalUrl;
    }

    // --- GOOGLE DRIVE FIX (Fixes 404 Error) ---
    // Detects drive.google.com, docs.google.com, or plain IDs
    if (finalUrl.includes('drive.google.com') || finalUrl.includes('docs.google.com') || (finalUrl.match(/^[a-zA-Z0-9_-]{20,}$/) && !finalUrl.startsWith('http'))) {
        
        let id = '';
        if (finalUrl.startsWith('http')) {
             // Extract ID from /d/ID or id=ID or open?id=ID
             const match = finalUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || finalUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
             if (match && match[1]) {
                 id = match[1];
             }
        } else {
            // Assume the whole string is the ID if it looks like one
            id = finalUrl;
        }

        // Only return the converted URL if we successfully extracted an ID
        if (id) {
            // CRITICAL FIX: Use 'drive.google.com' instead of 'docs.google.com'
            return `https://drive.google.com/uc?export=download&id=${id}`;
        }
        
        // Fallback: If we couldn't find an ID, return original URL (better than broken 404 link)
        return finalUrl;
    }

    if (finalUrl.startsWith('http') || finalUrl.startsWith('blob:')) return finalUrl;
    
    // Fallback (Assume ID)
    return `https://drive.google.com/uc?export=download&id=${finalUrl}`;
};

// --- ARTIST PROFILE DATA ---
export const ARTIST_DATA = {
    name: "Willwi 陳威兒",
    englishName: "WILLWI", 
    title: "Singer-Songwriter & Producer",
    images: {
        // UPDATE: New High Res Image ID: 1CoOpBFrsnvr7Z16MIc_Xxyr63ieOuIsW
        hero: "https://wsrv.nl/?url=drive.google.com/uc?id=1CoOpBFrsnvr7Z16MIc_Xxyr63ieOuIsW&output=jpg&w=2500&q=100", 
        profile: "https://wsrv.nl/?url=drive.google.com/uc?id=1CoOpBFrsnvr7Z16MIc_Xxyr63ieOuIsW&output=jpg&w=2500&q=100" 
    },
    featuredSong: {
        title: "Beloved 摯愛 (The 2026 Collection)",
        url: "https://www.dropbox.com/scl/fi/rwcmf3btrk3j6k55r518l/Beloved-The-2026-Collection.mp3?rlkey=v14343143&raw=1"
    },
    bio: {
        zh: `日本演歌歌手 小林幸子 老師說過：
「舞台是自己唱出來的，不是人家給的。」

我一直記得這句話。

所以這個計畫，
不是等誰來決定我該留下什麼。
而是把選擇攤開來，
讓作品自己站出來。`,
        
        en: `The legendary Sachiko Kobayashi once said:
"The stage is earned through singing, not given."

This quote stands as my highest guiding principle.

So this project isn't about waiting for someone to decide what I should keep.
It is about laying out the choices,
and letting the work speak for itself.`,

        jp: `演歌の女王・小林幸子先生の言葉を、私の音楽人生の指針としています。
「舞台は誰かに与えられるものではなく、自分で歌って掴み取るもの。」

この言葉をいつも胸に刻んでいます。

だからこそ、このプロジェクトは、
誰かが何を残すべきか決めるのを待つものではありません。
選択肢を広げ、
作品そのものが立ち上がるようにするものです。`
    },
    copyright: {
        text: "© 2026 Willwi Music Production. All Rights Reserved.",
        credits: [
            "Executive Producer: Tsung Yu Chen",
            "Visual Direction: Studio Gold",
            "Distributed by: Willwi Music"
        ]
    }
};

export const TRANSLATIONS = {
    zh: {
        enter: "進入票選",
        homeBody: "這不是一張已經完成的專輯\n它還在被選擇\n\n我準備了 40 首作品\n它們來自不同時間、不同狀態\n也來自不同合作關係\n\n在正式完成 2026 年專輯之前\n我選擇先把它們放在這裡\n\n不是為了測試市場\n也不是為了迎合誰\n只是想看看\n真正被留下的會是哪一些",
        profile: "關於",
        managerLogin: "管理員登入",
        copyright: "© 2026 WILLWI MUSIC. All Rights Reserved.",
        
        // Intro Step
        aboutTitle: "BELOVED 摯愛\n2026 專輯票選計畫",
        aboutIntro: "你現在做的事，不是在幫我投票，你是在參與一張專輯的形成。\n\n你選的每一首歌，都會被認真看待。\n你留下的每一句話，都會成為後續製作的參考。\n\n不需要寫得很好，只要是真實的。",
        warningTitle: "⚠️ 試聽須知",
        warningBody: "本頁所有歌曲皆為 Demo，部分作品尚未完成最終製作。\n請勿錄音、轉傳或外流，所有內容僅限於本網站內試聽。\n\n如果你願意尊重作品，作品才有機會走到最後。",
        start: "開始聆聽",
        backToSite: "返回首頁",

        // Voting Step
        selection: "投票方式",
        votingRule: "聽完之後選你想留下的歌。你不需要選滿，一首也可以。如果你願意，也可以告訴我你為什麼選它。",
        confirm: "確認選擇",
        selectMore: "請至少選擇 1 首歌曲",
        
        // Modal / Detail
        close: "關閉",
        voted: "已投票",
        voteForThis: "投給這首歌",
        tellUsWhy: "這首歌為什麼觸動了你？（選填）",
        reasonPlaceholder: "寫下你的感覺...",
        cancel: "取消",
        confirmSelection: "確認投票",
        openInApp: "無法播放？點此開啟原檔", // More direct instruction
        openLink: "開啟連結",
        playbackError: "播放失敗。請檢查權限或點此開啟原檔",

        // Auth Step
        finalInquiryTitle: "最後一步",
        finalInquiryPrompt: "送出前請填寫 Email，我會把一份有聲音樂卡片寄給你。\n這不是名單蒐集，而是一份回禮。",
        name: "您的稱呼",
        email: "電子信箱",
        submitFinal: "送出投票",
        
        // Success Step
        thankYou: "謝謝你",
        thankYouDesc: "謝謝你花時間聽，謝謝你願意留下。\n這張專輯完成的時候，它會記得你。",
    },
    en: {
        enter: "ENTER",
        homeBody: "This is not a finished album.\nIt is still being chosen.\n\nI have prepared 40 tracks from different times and states.\nBefore the official release of the 2026 album,\nI choose to place them here first.\n\nNot to test the market,\nNor to cater to anyone.\nJust to see,\nWhich ones will truly remain.",
        profile: "PROFILE",
        managerLogin: "MANAGER LOGIN",
        copyright: "© 2026 WILLWI MUSIC. All Rights Reserved.",

        // Intro Step
        aboutTitle: "BELOVED 2026 Campaign",
        aboutIntro: "What you are doing now is not just voting for me; you are participating in the formation of an album.\n\nEvery song you choose will be taken seriously.\nEvery word you leave will become a reference for future production.\n\nIt doesn't need to be written well, just real.",
        warningTitle: "⚠️ LISTENING POLICY",
        warningBody: "All tracks on this page are Demos; some are not yet in their final production stage.\nPlease do not record, repost, or leak.\nAll content is for listening within this website only.\n\nIf you are willing to respect the work, the work will have a chance to make it to the end.",
        start: "START LISTENING",
        backToSite: "RETURN HOME",

        // Voting Step
        selection: "SELECTION",
        votingRule: "Listen and choose the songs you want to keep. You don't need to pick 10; even one is fine. If you're willing, tell me why you chose it.",
        confirm: "CONFIRM",
        selectMore: "Please select at least 1 song.",

        // Modal / Detail
        close: "CLOSE",
        voted: "SELECTED",
        voteForThis: "VOTE FOR THIS TRACK",
        tellUsWhy: "Why did this song resonate with you? (Optional)",
        reasonPlaceholder: "Share your thoughts...",
        cancel: "CANCEL",
        confirmSelection: "CONFIRM VOTE",
        openInApp: "Can't play? Open File",
        openLink: "OPEN LINK",
        playbackError: "Playback Error. Click to open.",

        // Auth Step
        finalInquiryTitle: "Final Step",
        finalInquiryPrompt: "Please fill in your Email before submitting. I will send you an audio music card.\nThis is not a list collection, but a return gift.",
        name: "YOUR NAME",
        email: "EMAIL ADDRESS",
        submitFinal: "SUBMIT VOTE",

        // Success Step
        thankYou: "Thank You",
        thankYouDesc: "Thank you for taking the time to listen, thank you for being willing to stay.\nWhen this album is completed, it will remember you.",
    },
    jp: {
        enter: "入場する",
        homeBody: "これは完成したアルバムではありません。\nまだ選択の途中です。\n\n異なる時期、異なる状態の40曲を用意しました。\n2026年のアルバムが正式に完成する前に、\nまずはここに置くことを選びました。\n\n市場をテストするためでも、\n誰かに迎合するためでもありません。\nただ、どの曲が本当に残るのかを\n見てみたいだけです。",
        profile: "プロフィール",
        managerLogin: "管理者ログイン",
        copyright: "© 2026 WILLWI MUSIC. All Rights Reserved.",

        // Intro Step
        aboutTitle: "BELOVED 2026\n選抜キャンペーン",
        aboutIntro: "あなたが今していることは、単なる投票ではありません。アルバムの形成に参加しているのです。\n\nあなたが選んだすべての曲は真剣に受け止められます。\nあなたが残したすべての言葉は、今後の制作の参考になります。\n\n上手に書く必要はありません。リアルであればいいのです。",
        warningTitle: "⚠️ 試聴上の注意",
        warningBody: "このページのすべての曲はデモであり、一部の作品は最終制作段階ではありません。\n録音、転載、流出はしないでください。\nすべてのコンテンツは本サイト内での試聴に限ります。\n\n作品を尊重していただければ、作品は最後まで残るチャンスを得ることができます。",
        start: "試聴開始",
        backToSite: "ホームへ戻る",

        // Voting Step
        selection: "投票方法",
        votingRule: "聴いて、残したい曲を選んでください。10曲選ぶ必要はありません。1曲でも構いません。もしよろしければ、その理由も教えてください。",
        confirm: "確認",
        selectMore: "少なくとも1曲を選んでください",

        // Modal / Detail
        close: "閉じる",
        voted: "選択済み",
        voteForThis: "この曲に投票",
        tellUsWhy: "この曲を選んだ理由は？（任意）",
        reasonPlaceholder: "感想を入力...",
        cancel: "キャンセル",
        confirmSelection: "投票する",
        openInApp: "再生できない場合はこちら",
        openLink: "リンクを開く",
        playbackError: "エラー。元ファイルを開く",

        // Auth Step
        finalInquiryTitle: "最終ステップ",
        finalInquiryPrompt: "送信する前にメールアドレスを入力してください。オーディオ・ミュージックカードをお送りします。\nこれは名簿集めではなく、お返しです。",
        name: "お名前",
        email: "メールアドレス",
        submitFinal: "投票を送信",

        // Success Step
        thankYou: "ありがとう",
        thankYouDesc: "聴いてくれてありがとう、残ってくれてありがとう。\nこのアルバムが完成したとき、それはあなたを覚えているでしょう。",
    }
};

// --- DEFAULT SONGS (Initial Placeholder Data) ---
export const SONGS: Song[] = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  title: `Demo Track ${String(i + 1).padStart(2, '0')}`,
  driveId: '', 
  youtubeId: '',
  customAudioUrl: '',
  lyrics: "Lyrics pending...",
  credits: "Composed by Willwi"
}));

// --- MASTER DATA OVERRIDES (Hardcoded safeguards) ---
export const MASTER_SONG_DATA: { [id: number]: Partial<Song> } = {
    // Example Override if needed
    // 1: { title: "Opening Prologue" },
};

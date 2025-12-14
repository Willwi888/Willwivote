
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
        hero: "https://wsrv.nl/?url=drive.google.com/uc?id=1_ZLs1g_KrVzTYpYSD_oJYwlKjft26aP9&output=jpg&w=1200&q=100", 
        profile: "https://wsrv.nl/?url=drive.google.com/uc?id=1_ZLs1g_KrVzTYpYSD_oJYwlKjft26aP9&output=jpg&w=1200&q=100" 
    },
    featuredSong: {
        title: "Beloved 摯愛 (The 2026 Collection)",
        url: "https://www.dropbox.com/scl/fi/rwcmf3btrk3j6k55r518l/Beloved-The-2026-Collection.mp3?rlkey=v14343143&raw=1"
    },
    bio: {
        zh: `WILLWI 陳威兒，跨語系創作歌手與音樂製作人。

本次活動為預計於 2026 年第二季隆重發行的《摯愛 BELOVED》專輯之前導暖身票選。這張作品彙集了 40 首橫跨不同風格的創作，由於涉及多家唱片公司的版權合作與發行規劃，我們決定打破常規，將歌單的最終決定權交給聽眾。

這不僅是一張專輯，更是一場關於「選擇」的音樂實驗。

日本演歌女王 小林幸子 老師曾說過：
「舞台是自己唱出來的，不是人家給的。希望大家記得我是歌手，不是話題。」
這句話，是我音樂路上的最高準則。

以此為念。請聆聽，並選出你心中的摯愛。`,
        
        en: `WILLWI is a multilingual singer-songwriter and music producer.

This event serves as the official pre-heat voting campaign for the upcoming album "BELOVED," scheduled for release in Q2 2026. This collection features 40 tracks spanning various genres. Due to complex copyright collaborations, we have decided to entrust the final tracklist decision to you.

This is more than an album; it is a musical experiment about "choice."

The legendary Sachiko Kobayashi once said:
"The stage is earned through singing, not given. I hope to be remembered as a singer, not a topic."
This quote stands as my highest guiding principle.

With this in mind—listen, and choose your beloved.`,

        jp: `WILLWI（ウィルウィ）、マルチリンガル・シンガーソングライター兼音楽プロデューサー。

本イベントは、2026年第2四半期リリース予定のアルバム『摯愛 BELOVED』のプレ・キャンペーンです。様々なジャンルを網羅した40曲の未発表デモ音源を公開します。
複数のレーベルとの権利関係やリリース計画が複雑に絡み合うため、今回は従来の常識を覆し、最終的な収録曲の決定権をリスナーの皆様に託すことにしました。

これは単なるアルバム制作ではなく、「選択」という名の音楽実験です。

演歌の女王・小林幸子先生の言葉を、私の音楽人生の指針としています。
「舞台は誰かに与えられるものではなく、自分で歌って掴み取るもの。話題としてではなく、歌手として記憶されたい。」

この信念を胸に。
どうか試聴して、あなたの心に響く「摯愛」を選んでください。`
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
        homeBody: "每一首歌，都是靈魂的碎片。\n在 2026 年第二季《摯愛》正式降臨之前，\n因為版權與廠牌的跨界合作，\n我將 40 首未公開的創作交付予你。\n\n請聆聽，並選出你心中的摯愛。\n你的選擇，將決定這張專輯的模樣。",
        profile: "關於 威兒",
        managerLogin: "管理員登入",
        copyright: "© 2026 WILLWI MUSIC. All Rights Reserved.",
        
        // Intro Step
        aboutTitle: "《摯愛》2026 大碟票選活動",
        aboutIntro: "這不僅是一次投票，而是一次共同製作。\n\n這裡收錄了 40 首創作靈感，涵蓋了各種風格與語言。由於涉及不同唱片公司的合作規劃，我們需要先確認最終歌單。\n\n致謝名單與詳細製作資訊，將列於每一首歌曲的歌詞下方，以表達我最高的敬意。",
        warningTitle: "⚠️ 試聽須知",
        warningBody: "所有曲目皆為 Demo 或未混音版本，僅供本次活動內部試聽。\n請勿錄音、轉載或公開分享，違者將追究法律責任。",
        start: "開始聆聽",
        backToSite: "返回首頁",

        // Voting Step
        selection: "曲目票選",
        votingRule: "請選擇 10 首您最喜愛的歌曲",
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
        finalInquiryPrompt: "為了確保投票的真實性，並讓我們在專輯發行時通知您，請留下您的稱呼與聯繫方式。",
        name: "您的稱呼",
        email: "電子信箱",
        submitFinal: "送出投票",
        
        // Success Step
        thankYou: "感謝您的參與",
        thankYouDesc: "您的選擇已記錄。\n\n每一票對我來說都意義非凡。這張專輯因為有你的參與而更加完整。\n請靜候 2026 年，讓我們一起見證《摯愛》的誕生。",
    },
    en: {
        enter: "ENTER",
        homeBody: "Every song is a fragment of the soul.\nBefore the official release of 'BELOVED' in Q2 2026,\ndue to cross-label collaborations,\nI entrust 40 unreleased tracks to you.\n\nListen, and choose your beloved.\nYour choice will define this album.",
        profile: "PROFILE",
        managerLogin: "MANAGER LOGIN",
        copyright: "© 2026 WILLWI MUSIC. All Rights Reserved.",

        // Intro Step
        aboutTitle: "The 2026 'BELOVED' Campaign",
        aboutIntro: "This is not just a vote; it's a co-production.\n\nHere are 40 demos representing my creative journey. Due to multi-label planning, we need your help to finalize the tracklist.\n\nAcknowledgments and credits are listed below the lyrics of each track to express my deepest gratitude.",
        warningTitle: "⚠️ LISTENING POLICY",
        warningBody: "All tracks are Demos or unmixed versions for internal review only.\nDo not record, distribute, or share publicly.",
        start: "START LISTENING",
        backToSite: "RETURN HOME",

        // Voting Step
        selection: "SELECTION",
        votingRule: "Please select your top 10 favorites",
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
        finalInquiryPrompt: "To verify your vote and notify you upon release, please provide your details.",
        name: "YOUR NAME",
        email: "EMAIL ADDRESS",
        submitFinal: "SUBMIT VOTE",

        // Success Step
        thankYou: "Thank You",
        thankYouDesc: "Your voice has been heard.\n\nEvery vote means the world to me. This album is now more complete because of you.\nStay tuned for 2026, and let's witness the birth of 'BELOVED' together.",
    },
    jp: {
        enter: "入場する",
        homeBody: "すべての歌は、魂の欠片。\n2026年第2四半期、「BELOVED」が正式にリリースされる前に、\n版権とレーベルの枠を超えて、\n未公開の40曲をあなたに託します。\n\n聴いて、あなたの「最愛」を選んでください。\nその選択が、このアルバムの形を決めます。",
        profile: "プロフィール",
        managerLogin: "管理者ログイン",
        copyright: "© 2026 WILLWI MUSIC. All Rights Reserved.",

        // Intro Step
        aboutTitle: "2026『摯愛』選抜キャンペーン",
        aboutIntro: "これは単なる投票ではなく、共同制作です。\n\nここには、近年の創作活動から生まれた40曲のデモが収められています。異なるレコード会社間の調整が必要なため、最終的な曲目リストの決定権をあなたに委ねたいと思います。\n\n感謝のリストとクレジットは、各曲の歌詞の下に記載されています。",
        warningTitle: "⚠️ 試聴上の注意",
        warningBody: "すべての楽曲はデモ版です。\n録音、転載、公開共有は固くお断りします。",
        start: "試聴開始",
        backToSite: "ホームへ戻る",

        // Voting Step
        selection: "楽曲選択",
        votingRule: "お気に入りの10曲を選んでください",
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
        finalInquiryPrompt: "投票の真正性を確保し、リリース時にお知らせするため、お名前と連絡先をご記入ください。",
        name: "お名前",
        email: "メールアドレス",
        submitFinal: "投票を送信",

        // Success Step
        thankYou: "ご参加ありがとうございます",
        thankYouDesc: "あなたの選択は記録されました。\n\n一票一票が私にとって大きな意味を持ちます。あなたの参加により、このアルバムはより完全なものになります。\n2026年、『摯愛』の誕生を共に目撃しましょう。",
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

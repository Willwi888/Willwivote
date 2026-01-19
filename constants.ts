
import { Song, Language } from './types';

export const getAudioUrl = (source: string) => {
    if (!source) return '';
    let finalUrl = source.trim();

    if (finalUrl.includes('drive.google.com') || finalUrl.includes('docs.google.com')) {
        const match = finalUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || finalUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            return `https://drive.google.com/uc?export=download&id=${match[1]}`;
        }
    }
    
    if (finalUrl.includes('dropbox.com')) {
        return finalUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('dl=0', 'raw=1');
    }

    return finalUrl;
};

export const ARTIST_DATA = {
    name: "Willwi 陳威兒",
    englishName: "WILLWI", 
    title: "Singer-Songwriter & Producer",
    images: {
        hero: "https://wsrv.nl/?url=drive.google.com/uc?id=1CoOpBFrsnvr7Z16MIc_Xxyr63ieOuIsW&output=jpg&w=2500&q=100", 
        profile: "https://wsrv.nl/?url=drive.google.com/uc?id=1CoOpBFrsnvr7Z16MIc_Xxyr63ieOuIsW&output=jpg&w=2500&q=100" 
    },
    featuredSong: {
        title: "Beloved 摯愛 (Official Theme)",
        url: "https://www.dropbox.com/scl/fi/rwcmf3btrk3j6k55r518l/Beloved-The-2026-Collection.mp3?rlkey=v14343143&raw=1"
    },
    // 您提供的雲端資料夾
    folderLink: "https://drive.google.com/drive/folders/1-a42FKrfgyOHl_jBe-9A6Dn0kJtQhCM7",
    bio: {
        zh: `日本演歌歌手 小林幸子 老師說過：\n「舞台是自己唱出來的，不是人家給的。」\n\n我一直記得這句話。\n\n所以這個計畫，不是等誰來決定我該留下什麼。而是把選擇攤開來，讓作品自己站出來。`,
        en: `The legendary Sachiko Kobayashi once said:\n"The stage is earned through singing, not given."\n\nThis project isn't about waiting for someone to decide what I should keep. It is about laying out the choices, and letting the work speak for itself.`
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

/**
 * MASTER_SONG_DATA provides a way to hardcode metadata for specific track IDs.
 * This is used by storage.ts to merge with dynamic data from Supabase/Local Storage.
 */
export const MASTER_SONG_DATA: Record<number, Partial<Song>> = {};

export const TRANSLATIONS = {
    zh: {
        enter: "進入票選",
        homeBody: "這不是一張已經完成的專輯\n它還在被選擇\n\n我準備了 40 首作品\n它們來自不同時間、不同狀態\n也來自不同合作關係\n\n在正式完成 2026 年專輯之前\n我選擇先把它們放在這裡\n\n不是為了測試市場\n也不是為了迎合誰\n只是想看看\n真正被留下的會是哪一些",
        selection: "SELECTION",
        votingRule: "聽完之後，選出 10 首你想留下的歌。",
        start: "開始聆聽",
        confirm: "確認送出",
        thankYou: "謝謝你",
        thankYouDesc: "謝謝你花時間聽，這張專輯完成的時候，它會記得你。",
        memberDesc: "《摯愛》目前為會員優先開放內容。\n感謝你們長期的支持，也誠摯邀請你們給我一些回饋。",
        warningTitle: "⚠️ 試聽須知",
        warningBody: "本頁所有歌曲皆為 Demo，請勿錄音或外流。如果你願意尊重作品，作品才有機會走到最後。",
        reasonPlaceholder: "這首歌觸動了你什麼？（選填）",
        finalInquiryTitle: "訊息內容",
        finalInquiryPrompt: "送出前，如果有任何話想對我說，請留在這裡。",
        submitFinal: "完成參與",
        name: "您的稱呼",
        email: "電子信箱",
        backToSite: "返回官網",
        managerLogin: "管理員登入",
        copyright: "© 2026 Willwi Music Production.",
        memberTitle: "會員優先存取",
        memberPlaceholder: "請輸入存取密碼",
        memberError: "密碼錯誤，請重新輸入",
        memberSubmit: "驗證進入",
        aboutTitle: "關於票選計畫",
        aboutIntro: "這是一場關於共鳴的實驗。在 40 首作品中，哪些旋律能留在你的心底？",
        selectMore: "請至少選擇一首歌曲",
        tellUsWhy: "這首歌讓你聯想到了什麼？",
        finalInquiryPlaceholder: "寫下你的留言...",
        cancel: "取消",
        confirmSelection: "確認選擇",
        openInApp: "無法播放？開啟原檔",
        profile: "個人簡介",
        close: "關閉",
    },
    en: {
        enter: "ENTER",
        homeBody: "This is not a finished album.\nIt is still being chosen.\n\nI have prepared 40 tracks.\nBefore the 2026 album release,\nI choose to place them here first.\n\nJust to see,\nWhich ones will truly remain.",
        selection: "SELECTION",
        votingRule: "Listen and choose 10 tracks you want to keep.",
        start: "START",
        confirm: "CONFIRM",
        thankYou: "THANK YOU",
        thankYouDesc: "Thank you for listening. When this album is complete, it will remember you.",
        memberDesc: "Early Access for members only. Thank you for your support.",
        warningTitle: "⚠️ POLICY",
        warningBody: "These are Demos. Please do not leak. Respect the work.",
        reasonPlaceholder: "Why this track?",
        finalInquiryTitle: "MESSAGE",
        finalInquiryPrompt: "Leave a message for Willwi before you go.",
        submitFinal: "SUBMIT",
        name: "NAME",
        email: "EMAIL",
        backToSite: "BACK TO SITE",
        managerLogin: "ADMIN LOGIN",
        copyright: "© 2026 Willwi Music Production.",
        memberTitle: "MEMBER EARLY ACCESS",
        memberPlaceholder: "ACCESS CODE",
        memberError: "INCORRECT CODE",
        memberSubmit: "VERIFY",
        aboutTitle: "ABOUT THE PROJECT",
        aboutIntro: "This is an experiment in resonance. Among 40 tracks, which melodies will stay with you?",
        selectMore: "Please select at least one track",
        tellUsWhy: "What does this track remind you of?",
        finalInquiryPlaceholder: "Your message...",
        cancel: "CANCEL",
        confirmSelection: "CONFIRM SELECTION",
        openInApp: "Open in App",
        profile: "PROFILE",
        close: "CLOSE",
    }
};

export const SONGS: Song[] = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  title: `Track ${String(i + 1).padStart(2, '0')}`,
  driveId: '', 
  youtubeId: '',
  customAudioUrl: '',
  lyrics: "歌詞正在準備中...",
  credits: "PRODUCED BY WILLWI"
}));

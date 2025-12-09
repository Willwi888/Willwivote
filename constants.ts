
import { Song, Language } from './types';

// --- TRANSLATIONS ---
export const TRANSLATIONS = {
  zh: {
    title: "摯愛",
    subtitle: "2026 大碟票選活動",
    enter: "進入體驗",
    copyright: "© 2025 Willwi Music. All Rights Reserved.",
    managerLogin: "Manager Login",
    name: "您的名字",
    email: "電子郵件",
    giftMessage: "請留下您的信箱，我為您準備了一份專屬的「音樂有聲卡片」作為謝禮。",
    start: "開始",
    selection: "已選曲目",
    confirm: "確認投票",
    selectMore: "請選擇 10 首",
    lyrics: "歌詞",
    credits: "致謝",
    close: "關閉",
    votingRule: "請從下方試聽並選出您心中的 10 首摯愛。",
    thankYou: "感謝您的參與",
    thankYouDesc: "您的聲音已記錄，這張專輯因您而生。",
    mySelection: "我的選擇",
    back: "返回",
    voteForThis: "投給這首歌",
    voted: "已選擇",
    tellUsWhy: "為什麼選擇這首？",
    reasonPlaceholder: "這首歌讓我想起...",
    confirmSelection: "確認選擇",
    cancel: "取消",
    listenFirst: "試聽中...",
    voteAction: "投票",
  },
  en: {
    title: "BELOVED",
    subtitle: "The 2026 Collection",
    enter: "Enter Experience",
    copyright: "© 2025 Willwi Music. All Rights Reserved.",
    managerLogin: "Manager Login",
    name: "Your Name",
    email: "Email Address",
    giftMessage: "Please leave your email. I have prepared an exclusive 'Musical Audio Card' as a gift for you.",
    start: "Proceed",
    selection: "Selection",
    confirm: "Submit Votes",
    selectMore: "Select 10 Tracks",
    lyrics: "Lyrics",
    credits: "Credits",
    close: "Close",
    votingRule: "Listen and select your top 10 beloved tracks.",
    thankYou: "Thank You",
    thankYouDesc: "Your voice has been recorded. The album awaits.",
    mySelection: "My Selection",
    back: "Back",
    voteForThis: "Vote for this track",
    voted: "Selected",
    tellUsWhy: "Why this track?",
    reasonPlaceholder: "It reminds me of...",
    confirmSelection: "Confirm Selection",
    cancel: "Cancel",
    listenFirst: "Now Playing...",
    voteAction: "VOTE",
  },
  jp: {
    title: "最愛",
    subtitle: "2026 コレクション",
    enter: "体験する",
    copyright: "© 2025 Willwi Music. All Rights Reserved.",
    managerLogin: "管理者ログイン",
    name: "お名前",
    email: "メールアドレス",
    giftMessage: "メールアドレスを残してください。お礼として「音楽ボイスカード」をご用意しました。",
    start: "次へ",
    selection: "選択中",
    confirm: "投票する",
    selectMore: "10曲を選んでください",
    lyrics: "歌詞",
    credits: "クレジット",
    close: "閉じる",
    votingRule: "試聴して、あなたの最愛の10曲を選んでください。",
    thankYou: "ありがとうございます",
    thankYouDesc: "あなたの声は記録されました。",
    mySelection: "選択した曲",
    back: "戻る",
    voteForThis: "この曲に投票",
    voted: "選択済み",
    tellUsWhy: "選んだ理由は？",
    reasonPlaceholder: "この曲は...",
    confirmSelection: "確認",
    cancel: "キャンセル",
    listenFirst: "再生中...",
    voteAction: "投票",
  }
};

// Helper to extract ID from drive link if needed
const rawLinks = [
  "1Li45a4NhWYbrsuNDEPUOLos_q_dXbFYb", "1vjTJvdzuSnsbSTo3lwo42hEJhkdRs90n", "1vS56CRaIhsMKAmiPe2J8rFUKnAVElxDT", "15UTVstZSuSKxmSorirZXhwN0-seE8h2g",
  "1Z6q6pezf5GLApHJAYS6DoVhrWNljr4Zz", "137rgVEGSg3cQ9jhCv5MnBd9OP9Gk5qx1", "1IVeh7-lZgTZYOXNt-9pDtoGssYPGhLCL", "1r2DJz_jPFak3Y0YtDAzL7OAyVGskh8ep",
  "1CmswAAdYje5tZ_ZQX7ybsskXqXHrJaZj", "1oXwOwk83toZQOwlrK31UJxeix_wKuTqz", "1GglGIAG6RpmrJbDfZnpX1p-7cVdT7wAJ", "1pHRPqGEMtGk2JZhL0iFOJRhosWjnzOtj",
  "17kMshKpdV5GZYk0MN1NDisN4f3ixxsxb", "17J2ya5Xa0D03JGPoovnka5ku0kJ3yr7s", "1VxPtLtkwoUMUUTDI1PDmqLy3RfMUOs-O", "1fVyyp_1MAyCpXNgPFv5uCXkQf_BDGyIb",
  "15lucHVebvepaB-cPsopkbhdz6Giy15-E", "1SqEEckRVdSKWHiCZnTepu51YR2omq57h", "1upjG_A2AcMAzbqxtwjMpC_VxPZY6VBfu", "1ZBId5gxH5K6eBW7Be0UykJiS07oXZ-fg",
  "1C6MvTo6J5tYY11BNcRWZWJE1F344SNBp", "1iKKJFCMJco6qousIMXPHq2PxHqkYu8mE", "1hgdu4pRvlkFuQeSOt0JDgklQuwymb-pe", "1mizb3ZrF1BVh7yOgkVINmn1l5DUqUQNx",
  "18J0xnJtqdb-dQ9J8ga33u-IR7L1ZAN9C", "1sl5NHhlbAvCYzUvP1pbeQMKpBhyCwprn", "1qZcrJ0YxhpZwHHA3mkhnuIyWGe2jXHCu", "1pFLr9fvck5HhyQgGpW0U8M2U8K5ryb9I",
  "12hCifr5b_xTJFGTvzACj6h3L0qylHeRC", "1nJ7fF9wgWIj0-OKidT2Rt0M1wDeV7oCa", "1VwwF-7KgpZtLR1U418vwPgK1uuTr0O5e", "1Oau182WNb3yk_0LmMpOcjPPUxbghULsc",
  "1e83vC2OSvo37mVu92NygWOs27qqm66kP", "18Ku_1PmIf4RmWcMz6Ni3_XixNV0wQ1h9", "1HQ4sslfMKMHKFyYWDnGYQZkGMKAkDnpX", "1_KwydwL_5jWcdWHQoMcteSheBf8LXcWY",
  "1-TsGKaZr5FJ2VyHHgxmjDXYDITUEmdel", "1J43Or0vcwM48bL1l_IXvEw_206qrVNr2", "1hXsC8ZYDHloWVt0Xwgdy321WSKvXhR_1", "14XhIlgyQsv2yPjcPsFjFpCau4N-55KWr"
];

export const SONGS: Song[] = rawLinks.map((driveId, index) => ({
  id: index + 1,
  title: `Demo Track ${String(index + 1).padStart(2, '0')}`,
  driveId: driveId,
  lyrics: "",
  credits: ""
}));

// SMART AUDIO URL HELPER
export const getAudioUrl = (input: string) => {
    if (!input) return '';
    
    const url = input.trim();
    
    // Check for Full URL
    if (url.startsWith('http')) {
        // --- DROPBOX HANDLING ---
        // Match both 'www.dropbox.com' and 'dropbox.com'
        if (url.match(/dropbox\.com/)) {
            // Replace the domain with the content streaming domain
            const dlUrl = url.replace(/https?:\/\/(www\.)?dropbox\.com/, 'https://dl.dropboxusercontent.com');
            
            // Note: dl.dropboxusercontent.com works best without dl=0, but ignoring it is fine.
            // We preserve all query parameters (like rlkey, st) which are required for private/scl links.
            return dlUrl;
        }
        
        return url;
    }

    // Default to Google Drive ID if it's not a URL
    // Adding confirm=t sometimes helps bypass virus scan warnings on mobile which cause "No Data" errors
    return `https://drive.google.com/uc?export=download&confirm=t&id=${url}`;
};

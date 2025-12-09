
import { Song, Language } from './types';

// --- TRANSLATIONS ---
export const TRANSLATIONS = {
  zh: {
    title: "摯愛",
    subtitle: "2026 大碟票選活動",
    enter: "進入鑑賞",
    copyright: "© 2025 Willwi Music. Powered by Google YouTube.",
    managerLogin: "Manager Login",
    name: "您的尊稱",
    email: "電子郵件",
    giftMessage: "這是一場私密的音樂聽證會。請留下您的聯繫方式，我也許會寄送一份來自錄音室的禮物給您。",
    start: "開始鑑賞",
    selection: "您的摯愛",
    confirm: "確認並送出",
    selectMore: "請選擇 10 首曲目",
    lyrics: "歌詞",
    credits: "製作名單",
    close: "關閉",
    votingRule: "這些歌曲皆來自 YouTube 現場錄音室版本。請點擊曲目進入「影音鑑賞」，並選出您希望能被正式收錄的 10 首摯愛。",
    thankYou: "您的品味已記錄",
    thankYouDesc: "這張專輯的靈魂，因您的選擇而完整。",
    mySelection: "已選曲目",
    back: "返回",
    voteForThis: "加入摯愛",
    voted: "已收藏",
    tellUsWhy: "這首歌觸動了什麼？",
    reasonPlaceholder: "這段旋律讓我想起...",
    confirmSelection: "確認選擇",
    cancel: "取消",
    listenFirst: "鑑賞中...",
    voteAction: "投票",
    watchOnYoutube: "前往 YouTube 觀看",
  },
  en: {
    title: "BELOVED",
    subtitle: "The 2026 Collection",
    enter: "Enter Studio",
    copyright: "© 2025 Willwi Music. Powered by Google YouTube.",
    managerLogin: "Manager Login",
    name: "Your Name",
    email: "Email Address",
    giftMessage: "This is a private listening session. Please identify yourself, and I might send a gift from the studio.",
    start: "Begin Session",
    selection: "Your Beloved",
    confirm: "Submit Selection",
    selectMore: "Select 10 Tracks",
    lyrics: "Lyrics",
    credits: "Credits",
    close: "Close",
    votingRule: "These are high-fidelity Studio Live sessions from YouTube. Tap a track to enter the 'Cinema Mode' and select your top 10.",
    thankYou: "Taste Recorded",
    thankYouDesc: "The soul of this album is complete because of your choice.",
    mySelection: "My Selection",
    back: "Back",
    voteForThis: "Add to Beloved",
    voted: "Collected",
    tellUsWhy: "Why this track?",
    reasonPlaceholder: "It reminds me of...",
    confirmSelection: "Confirm",
    cancel: "Cancel",
    listenFirst: "Playing...",
    voteAction: "VOTE",
    watchOnYoutube: "Watch on YouTube",
  },
  jp: {
    title: "最愛",
    subtitle: "2026 コレクション",
    enter: "スタジオへ",
    copyright: "© 2025 Willwi Music. Powered by Google YouTube.",
    managerLogin: "管理者ログイン",
    name: "お名前",
    email: "メールアドレス",
    giftMessage: "これはプライベートな試聴会です。メールアドレスを残していただければ、スタジオから贈り物をお届けするかもしれません。",
    start: "開始",
    selection: "あなたの最愛",
    confirm: "投票する",
    selectMore: "10曲を選んでください",
    lyrics: "歌詞",
    credits: "クレジット",
    close: "閉じる",
    votingRule: "これらはYouTubeからのスタジオライブ音源です。トラックをタップして「シネマモード」に入り、あなたの最愛の10曲を選んでください。",
    thankYou: "記録されました",
    thankYouDesc: "あなたの選択が、このアルバムに命を吹き込みます。",
    mySelection: "選択した曲",
    back: "戻る",
    voteForThis: "最愛に追加",
    voted: "選択済み",
    tellUsWhy: "選んだ理由は？",
    reasonPlaceholder: "このメロディは...",
    confirmSelection: "確認",
    cancel: "キャンセル",
    listenFirst: "再生中...",
    voteAction: "投票",
    watchOnYoutube: "YouTubeで見る",
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

// In a real scenario, the Admin should use the "Bulk Import" feature 
// to replace these with the actual YouTube links/IDs.
export const SONGS: Song[] = rawLinks.map((driveId, index) => ({
  id: index + 1,
  title: `Studio Session ${String(index + 1).padStart(2, '0')}`,
  driveId: driveId,
  lyrics: "",
  credits: ""
}));

// SMART AUDIO URL HELPER
export const getAudioUrl = (input: string) => {
    if (!input) return '';
    const url = input.trim();
    if (url.startsWith('http')) {
        if (url.match(/dropbox\.com/)) {
            let dlUrl = url.replace(/https?:\/\/(www\.)?dropbox\.com/, 'https://dl.dropboxusercontent.com');
            dlUrl = dlUrl.replace(/[?&]dl=0/, '');
            return dlUrl;
        }
        return url;
    }
    return `https://drive.google.com/uc?export=download&confirm=t&id=${url}`;
};

// --- YOUTUBE HELPERS ---
export const getYouTubeThumbnail = (id: string) => {
  // Returns the high-quality thumbnail
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`; // Using mqdefault for a slightly grittier/faster load in list, or maxresdefault for hero
};

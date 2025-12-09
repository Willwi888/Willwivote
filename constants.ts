
import { Song, Language } from './types';

// --- TRANSLATIONS ---
export const TRANSLATIONS = {
  zh: {
    // 1. Home (Manifesto)
    title: "摯愛",
    subtitle: "2026 大碟票選活動",
    homeBody: "《摯愛》，是一場關於理解、陪伴與被看見的旅程。\n這一次，我不是從創作開始，而是從你們的耳朵與心開始。\n\n從泡麵聲學院一路到今天，我親自演唱過無數你們點給我的歌。\n在那些夜晚裡，我看見了許多情感的影子。\n於是，我從中 精心挑選了 40 首歌曲，作為《摯愛》專輯可能走向的起點。\n\n最終會收錄多少首，我不想急著定案。\n因為這張專輯想保留的，是「我們一起選擇的溫度」。\n\n今天，邀請你從 40 首裡選出屬於你的感動。",
    enter: "開始投票",

    // 2. Guide (About This Project)
    aboutTitle: "為什麼邀請你一起決定《摯愛》？",
    aboutBody: "因為這張專輯不是我的獨白。\n它是一段由你們的留言、點歌、聆聽交織而成的共同記憶。\n\n這 40 首歌，來自泡麵聲學院的每一段即興與回應。\n是你們讓這些歌在深夜裡亮起。\n而我希望，最後真正被收入《摯愛》的歌曲，也由你們的感受來參與決定。\n\n你的一票不是排名，而是一份記憶。\n是某一句旋律曾經照亮你的一瞬。\n\n專輯最後會收錄多少首，將依照整體的情緒與故事自然長成。\n沒有框架，也不急著定案。\n\n因為《摯愛》，是我們一起完成的作品。",
    
    // 3. How to Vote
    howToTitle: "如何參與",
    howToBody: "這裡共有 我從泡麵聲學院精選出的 40 首歌曲。\n\n請選出 你最觸動的歌曲（1 ~ 10 首皆可）。\n\n送出後會跳出 留言框，你可以寫：\n為什麼選這些歌、它陪你度過的瞬間，或你想留下的一句話。\n你的留言可能會成為 MV 的文字素材之一。\n\n投票完成後，我會寄給你一張 有聲音樂卡片（Audio Postcard），作為我們一起完成《摯愛》的紀念。\n\n你不是聽眾，而是共同創作者。",
    
    // Auth Form
    managerLogin: "Manager Login",
    name: "您的尊稱",
    email: "電子郵件",
    start: "進入鑑賞", // Form submit button

    // 4. Voting & Selection
    selection: "您的摯愛",
    votingRule: "請選出您最觸動的歌曲 (最多 10 首)。",
    selectMore: "可選擇 1 ~ 10 首",
    mySelection: "已選曲目",
    confirm: "確認並送出",
    back: "返回",
    
    // Song Detail
    lyrics: "歌詞",
    credits: "製作名單",
    artistLabel: "Official Artist",
    watchOnYoutube: "前往 YouTube 觀看",
    voteForThis: "加入摯愛",
    voted: "已收藏",
    tellUsWhy: "這首歌觸動了什麼？(選填)",
    reasonPlaceholder: "這段旋律讓我想起...",
    confirmSelection: "確認選擇",
    cancel: "取消",
    
    // 5. Final Inquiry (Tell Me Why)
    finalInquiryTitle: "謝謝你選下這些歌",
    finalInquirySubtitle: "Tell Me Why",
    finalInquiryPrompt: "在這裡，我想聽你說一點故事。\n\n寫下：\n為什麼是它們\n哪一段旋律讓你停下\n或它陪你走過了什麼樣的夜晚\n\n你的留言不是評論，而是珍貴的情感痕跡。\n它可能成為 MV 的一部分，也會成為我創作裡的方向。\n\n《摯愛》真正想收進的，是你與音樂之間的連結。",
    finalInquiryPlaceholder: "寫下您的感受（您的文字可能會出現在未來的 MV 中）...",
    submitFinal: "傳送我的心意",
    reviewSelection: "您選擇的摯愛清單",

    // 6. Success / Thank You
    thankYou: "你的選擇與故事，我都收到了",
    thankYouDesc: "我會親自閱讀，也會親自珍惜。\n\n所有參與投票的人，都會收到我錄製的 有聲音樂卡片。\n這是一份獻給你的回禮，也是你曾在這段旅程中陪著我的證明。\n\n謝謝你願意一起完成《摯愛》。\n這張專輯的形狀，因你而更靠近真心。",
    close: "關閉",
    copyright: "© 2025 Willwi Music. All Rights Reserved.",
  },
  en: {
    // 1. Home
    title: "BELOVED",
    subtitle: "The 2026 Collection",
    homeBody: "“Beloved” is a journey of being understood, accompanied, and truly seen.\nThis time, the album doesn’t begin with my writing.\nIt begins with your ears, and your heart.\n\nFrom Noodle Acoustic Academy to now, I’ve sung countless songs requested by you.\nIn those late-night moments, I witnessed so many quiet emotions.\nFrom there, I carefully selected 40 songs as the starting point for what “Beloved” may become.\n\nHow many songs will be included in the final album?\nI’m not rushing to decide.\nBecause this album is meant to keep the warmth we create together.\n\nToday, I invite you to choose songs that speak to you.",
    enter: "Start Voting",

    // 2. Guide
    aboutTitle: "Why invite you to help shape “Beloved”?",
    aboutBody: "Because this album is not a monologue from me.\nIt is a shared memory shaped by your requests, your comments, and your listening.\n\nThese 40 songs come from moments in Noodle Acoustic Academy.\nYou are the ones who gave them light in the quiet hours.\nAnd I hope the songs that ultimately enter the album will be guided by your feelings.\n\nYour vote is not a ranking.\nIt is a memory.\nA moment when a melody spoke to you.\n\nThe final number of songs will grow naturally, according to the emotional arc we discover together.\nNo deadlines. No constraints.\n\n“Beloved” is something we build together.",
    
    // 3. How to Vote
    howToTitle: "How to Vote",
    howToBody: "Here are 40 songs selected from Noodle Acoustic Academy.\n\nChoose the ones that resonate with you (1 to 10 songs).\n\nAfter you submit, a comment box will appear. Write anything you wish:\nWhy you chose these songs\nA moment they accompanied you\nA line you want to leave behind\n\nYour words may be used as part of the MV visuals.\n\nAfter voting, you’ll receive an Audio Postcard, recorded personally as a thank-you gift.\n\nYou are not just a listener.\nYou are a co-creator.",
    
    managerLogin: "Manager Login",
    name: "Your Name",
    email: "Email Address",
    start: "Enter Studio",

    selection: "Your Beloved",
    votingRule: "Choose up to 10 songs that resonate with you.",
    selectMore: "Select 1 ~ 10 Tracks",
    mySelection: "My Selection",
    confirm: "Submit Selection",
    back: "Back",

    lyrics: "Lyrics",
    credits: "Credits",
    artistLabel: "Official Artist",
    watchOnYoutube: "Watch on YouTube",
    voteForThis: "Add to Beloved",
    voted: "Collected",
    tellUsWhy: "Why this track? (Optional)",
    reasonPlaceholder: "It reminds me of...",
    confirmSelection: "Confirm",
    cancel: "Cancel",

    finalInquiryTitle: "Thank you for choosing these songs",
    finalInquirySubtitle: "Tell Me Why",
    finalInquiryPrompt: "Here, I’d love to hear a little of your story.\n\nTell me:\nWhy these songs\nWhich moment or melody stayed with you\nOr what part of your life they quietly walked beside\n\nYour message isn’t a review.\nIt’s a trace of your truth.\nIt may become part of the MV, and part of the direction of this album.\n\n“Beloved” is built from your connection with the music.",
    finalInquiryPlaceholder: "Write your thoughts (Your words might appear in a future MV)...",
    submitFinal: "Send My Thoughts",
    reviewSelection: "Your Beloved List",

    thankYou: "Your choices and your stories have reached me",
    thankYouDesc: "I will read them all personally, and I will keep them close.\n\nEveryone who participates will receive an Audio Postcard recorded by me.\nIt is my gift to you, and a quiet proof that you walked with me through this journey.\n\nThank you for helping shape “Beloved.”\nBecause of you, this album grows closer to its true heart.",
    close: "Close",
    copyright: "© 2025 Willwi Music. All Rights Reserved.",
  },
  jp: {
    // 1. Home
    title: "最愛",
    subtitle: "2026 コレクション",
    homeBody: "「摯愛」は、理解されること、寄り添われること、そして見つめ返される旅です。\n今回は、創作からではなく、あなたの耳と心から始まります。\n\n泡麵声学院で、私は数えきれないほどのリクエスト曲を歌ってきました。\nその夜ごとに、さまざまな想いの影が見えました。\nその中から 40曲を丁寧に選び 「摯愛」が向かうかもしれない最初の景色にしました。\n\n最終的に何曲が収録されるかは、まだ決めていません。\nこのアルバムが大切にしたいのは「あなたと一緒に選ぶ温度」だからです。\n\n40曲の中から、あなたの好きな曲を選んでください。",
    enter: "投票を始める",

    // 2. Guide
    aboutTitle: "なぜ「摯愛」をあなたと一緒に形にしたいのか",
    aboutBody: "このアルバムは、私だけの独白ではありません。\nあなたのリクエスト、言葉、そして聴いてくれた時間で編まれた共同の記憶です。\n\n40曲は泡麵声学院で生まれた即興と対話の断片。\n深夜にそれらを灯してくれたのは、あなたです。\nだからこそ、最終的に「摯愛」に収められる曲も、あなたの想いを受けて決めたいのです。\n\n一票は順位ではなく、記憶です。\nある旋律があなたの心に触れた、その一瞬。\n\n最終収録曲数は、物語の流れと感情に合わせて自然に形づくられます。\n枠も、急ぎもありません。\n\n「摯愛」は、あなたと共につくる作品です。",
    
    // 3. How to Vote
    howToTitle: "参加方法",
    howToBody: "ここには 泡麵声学院から選んだ40曲 が並んでいます。\n\n心に響いた曲を選んでください（1〜10曲）。\n\n送信後、コメント欄 が表示されます。\nなぜその曲を選んだのか\nその曲が寄り添ってくれた瞬間\n残したいひと言\n\nあなたの言葉は、MVの文字素材として使用される可能性があります。\n\n投票後、感謝の気持ちとして 音声付きミュージックカード をお送りします。\n\nあなたはただのリスナーではなく、共に創る仲間です。",
    
    managerLogin: "管理者ログイン",
    name: "お名前",
    email: "メールアドレス",
    start: "スタジオへ",

    selection: "あなたの最愛",
    votingRule: "心に響いた曲を選んでください (最大10曲)。",
    selectMore: "1 ~ 10曲を選んでください",
    mySelection: "選択した曲",
    confirm: "投票する",
    back: "戻る",

    lyrics: "歌詞",
    credits: "クレジット",
    artistLabel: "Official Artist",
    watchOnYoutube: "YouTubeで見る",
    voteForThis: "最愛に追加",
    voted: "選択済み",
    tellUsWhy: "選んだ理由は？ (任意)",
    reasonPlaceholder: "このメロディは...",
    confirmSelection: "確認",
    cancel: "キャンセル",

    finalInquiryTitle: "選んでくれて、ありがとうございます",
    finalInquirySubtitle: "Tell Me Why",
    finalInquiryPrompt: "ここでは、少しだけあなたの物語を聞かせてください。\n\n書いてほしいこと\nなぜその曲なのか\n心に残った旋律や瞬間\nその曲が寄り添ってくれた時間\n\nあなたの言葉は批評ではなく、かけがえのない感情の痕跡です。\nMVの一部となるかもしれませんし、この作品の方向性にもつながります。\n\n「摯愛」が収めたいのは、あなたと音楽の結びつきです。",
    finalInquiryPlaceholder: "想いをここに（あなたの言葉が将来のMVに登場するかもしれません）...",
    submitFinal: "想いを送る",
    reviewSelection: "選択したリスト",

    thankYou: "あなたが選んだ曲、あなたが書いてくれた言葉",
    thankYouDesc: "すべて受け取りました。大切に読ませていただきます。\n\n投票してくれたすべての方に、私からの 音声付きミュージックカード をお送りします。\nそれは感謝の気持ちであり、この旅を一緒に歩いてくれた証です。\n\n「摯愛」という作品が、本当の姿に近づくのはあなたのおかげです。",
    close: "閉じる",
    copyright: "© 2025 Willwi Music. All Rights Reserved.",
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
    // FIX FOR MOBILE: Use docs.google.com without confirm=t
    // OLD: return `https://drive.google.com/uc?export=download&confirm=t&id=${url}`;
    return `https://docs.google.com/uc?export=download&id=${url}`;
};

// --- YOUTUBE HELPERS ---
export const getYouTubeThumbnail = (id: string) => {
  // Returns the high-quality thumbnail (hqdefault is 480x360, better than mqdefault)
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`; 
};

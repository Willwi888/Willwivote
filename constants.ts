
import { Song, Language, SocialLink } from './types';

// --- ARTIST PROFILE DATA ---
export const ARTIST_DATA = {
    name: "Willwi 陳威兒",
    englishName: "WILLWI", 
    title: "Singer-Songwriter & Producer",
    images: {
        // Main Visual / Album Cover (Man in Suit) - Used for both Background & Profile
        hero: "https://drive.google.com/uc?export=view&id=1_ZLs1g_KrVzTYpYSD_oJYwlKjft26aP9", 
        
        // Secondary Profile Image (Now using the same Main Visual per request)
        profile: "https://drive.google.com/uc?export=view&id=1_ZLs1g_KrVzTYpYSD_oJYwlKjft26aP9" 
    },
    // MAIN FEATURED VIDEO -> FULL ALBUM PLAYLIST
    featuredSong: {
        title: "Beloved 摯愛 (The 2026 Collection)",
        // The YouTube Playlist containing the 40 songs
        url: "https://www.youtube.com/playlist?list=PLNXUTdsHGB-ylxLTlhASHNbYQ4VT0CRIA" 
    },
    bio: {
        zh: `來自台灣的 Willwi 陳威兒，是一位跨語系創作歌手與音樂製作人。\n作品多次獲得 Spotify 等國際串流平台編輯精選與推薦。\n\n「語言對我而言是承載情緒的器皿。」\n此理念貫穿其創作方向，並推動他持續探索多語系流行音樂的可能性。`,
        en: `Willwi Chen Wei-Er is a multilingual singer-songwriter and music producer from Taiwan.\nRecognized for cross-cultural storytelling and a distinct vocal identity.\n\n“For me, language is a vessel for emotion.”`
    },
    copyright: {
        year: "2026",
        owner: "Willwi Music",
        credits: [
            "Executive Producer | Willwi",
            "Musical Director | Will Chen",
            "Visual Arts | Willwi Studio",
            "Distributed by | Willwi Music"
        ]
    },
    links: {
        website: "https://willwi.com/",
        email: "will@willwi.com",
        socials: [
            { platform: "YouTube", url: "https://www.youtube.com/@Willwi888", icon: "youtube" },
            { platform: "Spotify", url: "https://open.spotify.com/artist/3ascZ8Rb2KDw4QyCy29Om4", icon: "spotify" },
            { platform: "Instagram", url: "https://www.instagram.com/willwi888", icon: "instagram" },
            { platform: "Apple Music", url: "https://music.apple.com/us/artist/willwi/1798471457", icon: "apple" }
        ] as SocialLink[]
    }
};

// --- MASTER DATA: PRE-FILLED CONTENT ---
export const MASTER_SONG_DATA: Record<number, Partial<Song>> = {
  1: {
      title: "Midnight Tokyo (Official Video)",
      youtubeId: "M7FIvfx5J10", 
      lyrics: "Walking through the neon lights...\n(This is a demo track for the Official Artist Channel)",
      credits: "Director: Willwi"
  },
  2: {
      title: "Taipei Rain 台北的雨 (Live)",
      youtubeId: "M7FIvfx5J10", 
      lyrics: "The rain falls on the city...",
      credits: "Piano: Willwi"
  },
  3: {
      title: "Parisian Dreams (Visualizer)",
      youtubeId: "M7FIvfx5J10",
      lyrics: "Sous le ciel de Paris...",
      credits: "Arrangement: Willwi"
  },
  4: {
      title: "Seoul Memories (Studio)",
      youtubeId: "M7FIvfx5J10",
      credits: "Producer: Will Chen"
  },
  5: {
      title: "New York Jazz",
      youtubeId: "M7FIvfx5J10",
      credits: "Bass: Willwi"
  },
  6: {
      title: "The Silent Ocean",
      customAudioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      credits: "Ambient Design: Willwi"
  },
  7: {
      title: "Golden Hour (Acoustic)",
      youtubeId: "M7FIvfx5J10",
  },
  8: {
      title: "Lost in Translation",
      youtubeId: "M7FIvfx5J10", 
  },
  9: {
      title: "Echoes of Time",
      customAudioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"
  },
  10: {
      title: "Beloved 摯愛 (Final Chapter)",
      youtubeId: "M7FIvfx5J10"
  },
};

// --- TRANSLATIONS ---
export const TRANSLATIONS = {
  zh: {
    // Artist Site
    profile: "個人檔案",
    music: "音樂作品",
    contact: "聯絡資訊",
    enterEvent: "開始投票",
    backToSite: "返回首頁",

    // I. Home
    title: "摯愛",
    subtitle: "2026 大碟票選活動",
    homeBody: "《摯愛》，是一場關於理解、陪伴與被看見的旅程。\n\n從泡麵聲學院一路到今天，我親自演唱過無數你們點給我的歌。\n在那些夜晚裡，我看見了許多情感的影子。\n於是，我從中 精心挑選了 40 首歌曲，作為《摯愛》專輯可能走向的起點。\n\n今天，邀請你選出 1 ~ 10 首屬於你的感動。",
    enter: "進入投票所",

    // II. Guide / About (Split for layout)
    aboutTitle: "邀請您共同完成屬於你的摯愛",
    aboutIntro: "因為這張專輯不是我的獨白。\n它是一段由你們的留言、點歌、聆聽交織而成的共同記憶。",
    
    warningTitle: "重要提醒：",
    warningBody: "這 40 首歌曲包含未公開 Demo，請戴上耳機，將這份體驗留給自己。",
    
    aboutClosing: "是你們讓這些歌在深夜裡亮起。\n而我希望，最後真正被收入《摯愛》的歌曲，也由你們的感受來參與決定。\n\n你的一票不是排名，而是一份記憶。\n\n因為《摯愛》，是我們一起完成的作品。",

    // III. How to Vote
    howToTitle: "如何參與",
    howToBody: "這裡共有 我從泡麵聲學院精選出的 40 首歌曲。\n\n請選出 你最觸動的歌曲（最多 10 首）。\n\n送出後會跳出 留言框，你可以寫：\n為什麼選這些歌\n它陪你度過的瞬間\n\n你的留言可能會成為 MV 的文字素材之一。\n\n投票完成後，我會寄給你一張 有聲音樂卡片（Audio Postcard），作為我們一起完成《摯愛》的紀念。",

    // UI Elements
    managerLogin: "Manager Login",
    name: "您的尊稱",
    email: "電子郵件",
    start: "進入鑑賞",
    selection: "您的摯愛",
    votingRule: "請選出您最觸動的歌曲 (最多 10 首)。",
    selectMore: "可選擇 1 ~ 10 首",
    mySelection: "已選曲目",
    confirm: "確認並送出",
    back: "返回",
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

    // IV. Inquiry (Final Modal)
    finalInquiryTitle: "謝謝你選下這幾首歌",
    finalInquiryPrompt: "在這裡，我想聽你說一點故事。\n\n寫下：\n為什麼是它們\n哪一段旋律讓你停下\n或它陪你走過了什麼樣的夜晚\n\n你的留言不是評論，而是珍貴的情感痕跡。\n它可能成為 MV 的一部分，也會成為我創作裡的方向。\n(非強制，若不想留言可直接送出)",
    finalInquiryPlaceholder: "寫下您的感受（您的文字可能會出現在未來的 MV 中）...",
    submitFinal: "傳送我的心意",
    
    // V. Thank You
    thankYou: "你的選擇與故事，我都收到了",
    thankYouDesc: "我會親自閱讀，也會親自珍惜。\n\n所有參與投票的人，都會收到我錄製的 有聲音樂卡片。\n這是一份獻給你的回禮，也是你曾在這段旅程中陪著我的證明。\n\n謝謝你願意一起完成《摯愛》。",
    close: "關閉",
    copyright: "© 2026 Willwi Music. All Rights Reserved.",
  },
  en: {
    profile: "Profile",
    music: "Music",
    contact: "Contact",
    enterEvent: "Start Voting",
    backToSite: "Back to Home",

    // I. Home
    title: "THE 2026 COLLECTION",
    subtitle: "BELOVED",
    homeBody: "“Beloved” is a journey of being understood, accompanied, and truly seen.\nThis time, the album doesn’t begin with my writing.\nIt begins with your ears, and your heart.\n\nFrom Noodle Acoustic Academy to now, I’ve carefully selected 40 songs as the starting point for what “Beloved” may become.\n\nToday, I invite you to choose up to 10 songs that speak to you.",
    enter: "Start Voting",

    // II. Guide / About
    aboutTitle: "Inviting you to complete “Beloved”",
    aboutIntro: "Because this album is not a monologue from me.\nIt is a shared memory shaped by your requests, your comments, and your listening.",
    
    warningTitle: "Important Reminder:",
    warningBody: "These songs include unreleased demos. Please use headphones and keep this experience to yourself.",
    
    aboutClosing: "You are the ones who gave them light in the quiet hours.\nAnd I hope the songs that ultimately enter the album will be guided by your feelings.\n\n“Beloved” is something we build together.",

    // III. How to Vote
    howToTitle: "How to Vote",
    howToBody: "Choose up to 10 songs that resonate with you the most.\n\nAfter you submit, a comment box will appear. Write anything you wish.\n\nYour words may be used as part of the MV visuals.\n\nAfter voting, you’ll receive an Audio Postcard, recorded personally as a thank-you gift.",

    // UI Elements
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

    // IV. Inquiry
    finalInquiryTitle: "Thank you for choosing these songs",
    finalInquiryPrompt: "Here, I’d love to hear a little of your story.\n\nTell me:\nWhy these songs\nWhich moment or melody stayed with you\n\nYour message isn’t a review.\nIt’s a trace of your truth.\n(Optional - you can skip this)",
    finalInquiryPlaceholder: "Write your thoughts (Your words might appear in a future MV)...",
    submitFinal: "Send My Thoughts",

    // V. Thank You
    thankYou: "Your choices and your stories have reached me",
    thankYouDesc: "I will read them all personally, and I will keep them close.\n\nThank you for helping shape “Beloved.”",
    close: "Close",
    copyright: "© 2026 Willwi Music. All Rights Reserved.",
  },
  jp: {
    profile: "プロフィール",
    music: "音楽",
    contact: "お問い合わせ",
    enterEvent: "投票を始める",
    backToSite: "公式サイトへ戻る",

    // I. Home
    title: "最愛",
    subtitle: "2026 コレクション",
    homeBody: "「摯愛」は、理解されること、寄り添われること、そして見つめ返される旅です。\n泡麵声学院で歌ってきた数えきれないリクエスト曲の中から、40曲を丁寧に選びました。\n\nこのアルバムが大切にしたいのは「あなたと一緒に選ぶ温度」です。\n\n最大10曲まで、あなたの心に響く曲を選んでください。",
    enter: "投票を始める",

    // II. Guide / About
    aboutTitle: "あなたと共に「摯愛」を完成させたい",
    aboutIntro: "このアルバムは、私だけの独白ではありません。\nあなたのリクエスト、言葉、そして聴いてくれた時間で編まれた共同の記憶です。",
    
    warningTitle: "重要なお知らせ：",
    warningBody: "未発表デモが含まれています。イヤホンをして、この体験をあなただけのものにしてください。",
    
    aboutClosing: "40曲は泡麵声学院で生まれた即興と対話の断片。\n深夜にそれらを灯してくれたのは、あなたです。\n\n「摯愛」は、あなたと共につくる作品です。",

    // III. How to Vote
    howToTitle: "参加方法",
    howToBody: "ここには 40曲 が並んでいます。\n\n心に響いた曲（最大10曲）を選んでください。\n\n送信後、コメント欄 が表示されます。\n\nあなたの言葉は、MVの文字素材として使用される可能性があります。\n\n投票後、感謝の気持ちとして 音声付きミュージックカード をお送りします。",

    // UI Elements
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

    // IV. Inquiry
    finalInquiryTitle: "選んでくれて、ありがとうございます",
    finalInquiryPrompt: "ここでは、少しだけあなたの物語を聞かせてください。\n\nなぜその曲なのか\n心に残った旋律や瞬間\n\nあなたの言葉は批評ではなく、かけがえのない感情の痕跡です。\n(任意ですので、空欄でも構いません)",
    finalInquiryPlaceholder: "想いをここに（あなたの言葉が将来のMVに登場するかもしれません）...",
    submitFinal: "想いを送る",

    // V. Thank You
    thankYou: "あなたが選んだ曲、あなたが書いてくれた言葉",
    thankYouDesc: "すべて受け取りました。大切に読ませていただきます。\n\n「摯愛」という作品が、本当の姿に近づくのはあなたのおかげです。",
    close: "閉じる",
    copyright: "© 2026 Willwi Music. All Rights Reserved.",
  }
};

// Initialize the 40 slots
export const SONGS: Song[] = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  title: `Studio Session ${String(i + 1).padStart(2, '0')}`,
  driveId: '',
  youtubeId: '',
  lyrics: '',
  credits: ''
}));

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
    
    if (url.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(url)) {
        return '';
    }

    // Default to Drive for other IDs
    return `https://drive.google.com/uc?export=download&confirm=t&id=${url}`;
};

export const getYouTubeThumbnail = (id: string) => {
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`; 
};

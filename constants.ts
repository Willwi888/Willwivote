
import { Song, Language, SocialLink } from './types';

// --- ARTIST PROFILE DATA ---
export const ARTIST_DATA = {
    name: "Willwi 陳威兒",
    englishName: "", // CLEARED as requested
    title: "Singer-Songwriter & Multilingual Music Producer",
    // NEW: Featured Song for the Homepage (The "Song I Prepared")
    featuredSong: {
        title: "Beloved (Official Theme)",
        // Updated to user's provided Google Drive Audio
        url: "https://drive.google.com/uc?export=download&confirm=t&id=13q3cVDiNybStPN1TavtXnHpOkBrqY-W1" 
    },
    bio: {
        zh: `來自台灣的 Willwi 陳威兒，是一位跨語系創作歌手與音樂製作人。\n以中文、英文、日文、法文與韓文進行詞曲創作與聲音製作，並熟悉台語、義大利文與泰文。\n作品多次獲得 Spotify 等國際串流平台編輯精選與推薦，展現跨文化語境下的敘事能力與清晰可辨的聲音風格。\n\n同時為 Musixmatch 認證藝人與策展人，並通過 Apple Music、Spotify、YouTube（OAC）、Amazon Music 等主要平台之官方認證，亦收錄於 Google Knowledge Graph。\n代表作《再愛一次》入選 Spotify 四大官方歌單，是少數同時具備「認證歌手」與「國際策展人」雙重身份的音樂創作者。\n\n「語言對我而言是承載情緒的器皿。」\n此理念貫穿其創作方向，並推動他持續探索多語系流行音樂的可能性。`,
        en: `Willwi Chen Wei-Er is a multilingual singer-songwriter and music producer from Taiwan.\nHe writes and produces music in Mandarin, English, Japanese, French, and Korean, with additional fluency in Taiwanese, Italian, and Thai.\nHis works have been repeatedly featured by Spotify and other major streaming platforms, recognized for cross-cultural storytelling and a distinct vocal identity.\n\nHe is a verified artist on Apple Music, Spotify, YouTube (OAC), Amazon Music, and Musixmatch, and is listed in the Google Knowledge Graph.\nHis track “Love Again” was selected for four major Spotify editorial playlists, making him one of the few music creators recognized both as a verified artist and an international curator.\n\n“For me, language is a vessel for emotion.”\nThis philosophy shapes his approach to multilingual composition and his ongoing exploration of contemporary pop music.`
    },
    copyright: {
        year: "2026",
        owner: "Willwi Music",
        credits: [
            "Main Artist : Willwi 陳威兒",
            "Composer : Tsung Yu Chen",
            "Lyricist : Tsung Yu Chen",
            "Arranger : Willwi",
            "Producer : Will Chen",
            "Recording Engineer | Will Chen",
            "Mixing Engineer | Will Chen",
            "Mastering Engineer | Will Chen",
            "Recording Studio | Willwi Studio, Taipei",
            "Label | Willwi Music"
        ]
    },
    links: {
        website: "https://willwi.com/",
        email: "will@willwi.com",
        socials: [
            { platform: "YouTube", url: "https://www.youtube.com/@Willwi888", icon: "youtube" },
            { platform: "Spotify", url: "https://open.spotify.com/artist/3ascZ8Rb2KDw4QyCy29Om4", icon: "spotify" },
            { platform: "Apple Music", url: "https://music.apple.com/us/artist/willwi/1798471457", icon: "apple" },
            { platform: "Amazon Music", url: "https://music.amazon.com/artists/B0DYFC8CTG/willwi", icon: "amazon" },
            { platform: "TIDAL", url: "https://tidal.com/artist/70636776", icon: "tidal" },
            { platform: "YouTube Music", url: "https://music.youtube.com/channel/UCAF8vdEOJ5sBdRuZXL61ASw", icon: "youtubemusic" },
            { platform: "Instagram", url: "https://www.instagram.com/willwi888", icon: "instagram" },
            { platform: "Facebook", url: "https://www.facebook.com/Willwi888", icon: "facebook" },
            { platform: "X (Twitter)", url: "https://x.com/@willwi888", icon: "twitter" },
            { platform: "TikTok", url: "https://www.tiktok.com/@willwi888", icon: "tiktok" }
        ] as SocialLink[]
    }
};

// --- MASTER DATA: SINGLE SOURCE OF TRUTH ---
export const MASTER_SONG_DATA: Record<number, Partial<Song>> = {
  1: {
      title: "Studio Session 01 (Audio Demo)",
      customAudioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", 
      lyrics: "This is a demo track for Audio Playback.\n\n(Verse 1)\nThe night is young\nThe stars are bright\nWe are voting for the light",
      credits: "Arrangement: Willwi\nMixing: Willwi"
  },
  2: {
      title: "Studio Session 02 (YouTube Demo)",
      youtubeId: "M7FIvfx5J10", 
      lyrics: "This is a demo track for YouTube Integration.\n\nClicking this item opens the video player.\nThe visual experience is synchronized.",
      credits: "Director: Willwi"
  },
  // Placeholders for remaining songs
  3: { title: "Midnight Echo", lyrics: "In the silence of the room...", credits: "Piano: Willwi" },
  40: { title: "The End", lyrics: "Closing the book...", credits: "Piano: Willwi" }
};

// --- TRANSLATIONS ---
export const TRANSLATIONS = {
  zh: {
    // Artist Site
    profile: "個人檔案",
    music: "音樂作品",
    contact: "聯絡資訊",
    enterEvent: "開始投票",
    backToSite: "返回官方網站",

    // I. Home
    title: "摯愛",
    subtitle: "2026 大碟票選活動",
    homeBody: "《摯愛》，是一場關於理解、陪伴與被看見的旅程。\n這一次，我不是從創作開始，而是從你們的耳朵與心開始。\n\n從泡麵聲學院一路到今天，我親自演唱過無數你們點給我的歌。\n在那些夜晚裡，我看見了許多情感的影子。\n於是，我從中 精心挑選了 40 首歌曲，作為《摯愛》專輯可能走向的起點。\n\n最終會收錄多少首，我不想急著定案。\n因為這張專輯想保留的，是「我們一起選擇的溫度」。\n\n今天，邀請你選出 1 ~ 10 首屬於你的感動。",
    enter: "開始投票",

    // II. Guide / About (Split for layout)
    aboutTitle: "邀請您共同完成屬於你的摯愛",
    aboutIntro: "因為這張專輯不是我的獨白。\n它是一段由你們的留言、點歌、聆聽交織而成的共同記憶。",
    
    warningTitle: "重要提醒：",
    warningBody: "這 40 首歌曲嚴格禁止分享與外流。\n因為這是即將發行的正式作品，請戴上耳機，將這份體驗留給自己。",
    
    aboutClosing: "是你們讓這些歌在深夜裡亮起。\n而我希望，最後真正被收入《摯愛》的歌曲，也由你們的感受來參與決定。\n\n你的一票不是排名，而是一份記憶。\n是某一句旋律曾經照亮你的一瞬。\n\n專輯最後會收錄多少首，將依照整體的情緒與故事自然長成。\n沒有框架，也不急著定案。\n\n因為《摯愛》，是我們一起完成的作品。",

    // III. How to Vote
    howToTitle: "如何參與",
    howToBody: "這裡共有 我從泡麵聲學院精選出的 40 首歌曲。\n\n請選出 你最觸動的歌曲（最多 10 首）。\n\n送出後會跳出 留言框，你可以寫：\n為什麼選這些歌\n它陪你度過的瞬間\n或你想留下的一句話\n\n你的留言可能會成為 MV 的文字素材之一。\n\n投票完成後，我會寄給你一張 有聲音樂卡片（Audio Postcard），作為我們一起完成《摯愛》的紀念。\n\n你不是聽眾，而是共同創作者。",

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
    finalInquiryPrompt: "在這裡，我想聽你說一點故事。\n\n寫下：\n為什麼是它們\n哪一段旋律讓你停下\n或它陪你走過了什麼樣的夜晚\n\n你的留言不是評論，而是珍貴的情感痕跡。\n它可能成為 MV 的一部分，也會成為我創作裡的方向。\n(非強制，若不想留言可直接送出)\n\n《摯愛》真正想收進的，是你與音樂之間的連結。",
    finalInquiryPlaceholder: "寫下您的感受（您的文字可能會出現在未來的 MV 中）...",
    submitFinal: "傳送我的心意",
    
    // V. Thank You
    thankYou: "你的選擇與故事，我都收到了",
    thankYouDesc: "我會親自閱讀，也會親自珍惜。\n\n所有參與投票的人，都會收到我錄製的 有聲音樂卡片。\n這是一份獻給你的回禮，也是你曾在這段旅程中陪著我的證明。\n\n謝謝你願意一起完成《摯愛》。\n這張專輯的形狀，因你而更靠近真心。",
    close: "關閉",
    copyright: "© 2026 Willwi Music. All Rights Reserved.",
  },
  en: {
    profile: "Profile",
    music: "Music",
    contact: "Contact",
    enterEvent: "Start Voting",
    backToSite: "Back to Official Site",

    // I. Home
    title: "THE 2026 COLLECTION",
    subtitle: "BELOVED",
    homeBody: "“Beloved” is a journey of being understood, accompanied, and truly seen.\nThis time, the album doesn’t begin with my writing.\nIt begins with your ears, and your heart.\n\nFrom Noodle Acoustic Academy to now, I’ve sung countless songs requested by you.\nIn those late-night moments, I witnessed so many quiet emotions.\nFrom there, I carefully selected 40 songs as the starting point for what “Beloved” may become.\n\nHow many songs will be included in the final album?\nI’m not rushing to decide.\nBecause this album is meant to keep the warmth we create together.\n\nToday, I invite you to choose up to 10 songs that speak to you.",
    enter: "Start Voting",

    // II. Guide / About
    aboutTitle: "Inviting you to complete “Beloved”",
    aboutIntro: "Because this album is not a monologue from me.\nIt is a shared memory shaped by your requests, your comments, and your listening.",
    
    warningTitle: "Important Reminder:",
    warningBody: "These 40 songs are strictly prohibited from being shared.\nAs this is an upcoming official release, please use headphones and keep this experience to yourself.",
    
    aboutClosing: "You are the ones who gave them light in the quiet hours.\nAnd I hope the songs that ultimately enter the album will be guided by your feelings.\n\nYour vote is not a ranking.\nIt is a memory.\nA moment when a melody spoke to you.\n\nThe final number of songs will grow naturally, according to the emotional arc we discover together.\nNo deadlines. No constraints.\n\n“Beloved” is something we build together.",

    // III. How to Vote
    howToTitle: "How to Vote",
    howToBody: "Here are 40 songs selected from Noodle Acoustic Academy.\n\nChoose up to 10 songs that resonate with you the most.\n\nAfter you submit, a comment box will appear. Write anything you wish:\nWhy you chose these songs\nA moment they accompanied you\nA line you want to leave behind\n\nYour words may be used as part of the MV visuals.\n\nAfter voting, you’ll receive an Audio Postcard, recorded personally as a thank-you gift.\n\nYou are not just a listener.\nYou are a co-creator.",

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
    finalInquiryPrompt: "Here, I’d love to hear a little of your story.\n\nTell me:\nWhy these songs\nWhich moment or melody stayed with you\nOr what part of your life they quietly walked beside\n\nYour message isn’t a review.\nIt’s a trace of your truth.\nIt may become part of the MV, and part of the direction of this album.\n(Optional - you can skip this)",
    finalInquiryPlaceholder: "Write your thoughts (Your words might appear in a future MV)...",
    submitFinal: "Send My Thoughts",

    // V. Thank You
    thankYou: "Your choices and your stories have reached me",
    thankYouDesc: "I will read them all personally, and I will keep them close.\n\nEveryone who participates will receive an Audio Postcard recorded by me.\nIt is my gift to you, and a quiet proof that you walked with me through this journey.\n\nThank you for helping shape “Beloved.”\nBecause of you, this album grows closer to its true heart.",
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
    homeBody: "「摯愛」は、理解されること、寄り添われること、そして見つめ返される旅です。\n今回は、創作からではなく、あなたの耳と心から始まります。\n\n泡麵声学院で、私は数えきれないほどのリクエスト曲を歌ってきました。\nその夜ごとに、さまざまな想いの影が見えました。\nその中から 40曲を丁寧に選び 「摯愛」が向かうかもしれない最初の景色にしました。\n\n最終的に何曲が収録されるかは、まだ決めていません。\nこのアルバムが大切にしたいのは「あなたと一緒に選ぶ温度」だからです。\n\n最大10曲まで、あなたの心に響く曲を選んでください。",
    enter: "投票を始める",

    // II. Guide / About
    aboutTitle: "あなたと共に「摯愛」を完成させたい",
    aboutIntro: "このアルバムは、私だけの独白ではありません。\nあなたのリクエスト、言葉、そして聴いてくれた時間で編まれた共同の記憶です。",
    
    warningTitle: "重要なお知らせ：",
    warningBody: "この40曲の無断共有・流出は固く禁じられています。\nこれらは未発表の公式作品ですので、イヤホンをして、この体験をあなただけのものにしてください。",
    
    aboutClosing: "40曲は泡麵声学院で生まれた即興と対話の断片。\n深夜にそれらを灯してくれたのは、あなたです。\nだからこそ、最終的に「摯愛」に収められる曲も、あなたの想いを受けて決めたいのです。\n\n一票は順位ではなく、記憶です。\nある旋律があなたの心に触れた、その一瞬。\n\n最終収録曲数は、物語の流れと感情に合わせて自然に形づくられます。\n枠も、急ぎもありません。\n\n「摯愛」は、あなたと共につくる作品です。",

    // III. How to Vote
    howToTitle: "参加方法",
    howToBody: "ここには 泡麵声学院から選んだ40曲 が並んでいます。\n\n心に響いた曲（最大10曲）を選んでください。\n\n送信後、コメント欄 が表示されます。\nなぜその曲を選んだのか\nその曲が寄り添ってくれた瞬間\n残したいひと言\n\nあなたの言葉は、MVの文字素材として使用される可能性があります。\n\n投票後、感謝の気持ちとして 音声付きミュージックカード をお送りします。\n\nあなたはただのリスナーではなく、共に創る仲間です。",

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
    finalInquiryPrompt: "ここでは、少しだけあなたの物語を聞かせてください。\n\n書いてほしいこと\nなぜその曲なのか\n心に残った旋律や瞬間\nその曲が寄り添ってくれた時間\n\nあなたの言葉は批評ではなく、かけがえのない感情の痕跡です。\nMVの一部となるかもしれませんし、この作品の方向性にもつながります。\n(任意ですので、空欄でも構いません)\n\n「摯愛」が収めたいのは、あなたと音楽の結びつきです。",
    finalInquiryPlaceholder: "想いをここに（あなたの言葉が将来のMVに登場するかもしれません）...",
    submitFinal: "想いを送る",

    // V. Thank You
    thankYou: "あなたが選んだ曲、あなたが書いてくれた言葉",
    thankYouDesc: "すべて受け取りました。大切に読ませていただきます。\n\n投票してくれたすべての方に、私からの 音声付きミュージックカード をお送りします。\nそれは感謝の気持ちであり、この旅を一緒に歩いてくれた証です。\n\n「摯愛」という作品が、本当の姿に近づくのはあなたのおかげです。",
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

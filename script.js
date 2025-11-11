// データ管理用のキー
const STORAGE_KEY = 'slotData';
const EXPECTATION_MASTER_KEY = 'expectationMasterData';

// 現在表示中のカレンダーの年月
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// アプリ初期化
function initializeApp() {
    // フォーム送信イベント
    document.getElementById('registerForm').addEventListener('submit', handleFormSubmit);
    
    // 選択肢の変更を監視して期待値を自動設定
    document.getElementById('name').addEventListener('change', () => {
        updateTargetOptions(); // 機種名が変わったら狙い目を更新
        updateGameOptions(); // ゲーム数も更新
        updateDifferenceField(); // 差枚数欄の表示/非表示を更新
        updateRBCZFields(); // RB回数・CZ回数欄の表示/非表示を更新
    });
    document.getElementById('target').addEventListener('change', () => {
        updateGameOptions(); // 狙い目が変わったらゲーム数を更新
        updateDifferenceField(); // 差枚数欄の表示/非表示を更新
        updateRBCZFields(); // RB回数・CZ回数欄の表示/非表示を更新
    });
    document.getElementById('game').addEventListener('change', updateExpectation);
    document.getElementById('difference').addEventListener('change', updateExpectation);
    document.getElementById('rbCount').addEventListener('input', updateExpectation);
    document.getElementById('czCount').addEventListener('input', updateExpectation);
    
    // マスターデータから選択肢を生成
    loadMasterData();
    
    // メニューイベント
    setupMenu();
    
    // カレンダーイベント
    document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
    
    // 初期表示
    renderCalendar();
    renderDailyStats();
    updateStats();
    
    // インポート機能
    setupImport();
}

// メニュー設定
function setupMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuPanel = document.getElementById('menuPanel');
    const menuClose = document.getElementById('menuClose');
    const menuItems = document.querySelectorAll('.menu-item');
    
    function openMenu() {
        menuOverlay.classList.add('active');
        menuPanel.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeMenu() {
        menuOverlay.classList.remove('active');
        menuPanel.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    menuToggle.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    menuOverlay.addEventListener('click', closeMenu);
    
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            switchSection(section);
            closeMenu();
        });
    });
}

// セクション切り替え
function switchSection(sectionName) {
    // すべてのセクションを非表示
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // すべてのメニューアイテムからactiveを削除
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 選択されたセクションを表示
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // 選択されたメニューアイテムにactiveを追加
    const targetMenuItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (targetMenuItem) {
        targetMenuItem.classList.add('active');
    }
    
    // セクションに応じてデータを再描画
    if (sectionName === 'calendar') {
        renderCalendar();
        renderDailyStats();
    } else if (sectionName === 'stats') {
        updateStats();
    } else if (sectionName === 'import') {
        // インポートセクション表示時は特に処理なし
    }
}

// 機種別の狙い目リスト（特定機種用）
const MACHINE_SPECIFIC_TARGETS = {
    'ヴァルブレイブ２': [
        '朝一以外 CZ間天井狙い',
        '朝一 CZ間天井狙い',
        '朝一以外前回枚数別ボーナス、AT間天井狙い',
        'RB0回、CZ回数別AT間天井狙い詳細',
        'RB1回、CZ回数別AT間天井狙い詳細',
        'RB２回以上、CZ回数別AT間天井狙い詳細',
        '朝一RB0回、CZ回数別AT間天井狙い詳細'
    ]
};

// ヴァルブレイブ２「朝一以外 CZ間天井狙い」の期待値データ（G数範囲と期待値）
// 50貸/50交換と460枚 46-52の期待値を使用
const VALBRAVE2_ASAIGAI_CZ_EXPECTATIONS = [
    { gameMin: 80, gameMax: 89, expect: -705, expect460: -874 },     // 80～
    { gameMin: 90, gameMax: 99, expect: -703, expect460: -870 },     // 90～
    { gameMin: 100, gameMax: 109, expect: -750, expect460: -914 },  // 100～
    { gameMin: 110, gameMax: 119, expect: -781, expect460: -941 },  // 110～
    { gameMin: 120, gameMax: 129, expect: -821, expect460: -978 },  // 120～
    { gameMin: 130, gameMax: 139, expect: -859, expect460: -1014 },  // 130～
    { gameMin: 140, gameMax: 149, expect: -887, expect460: -1039 },  // 140～
    { gameMin: 150, gameMax: 159, expect: -957, expect460: -1104 },  // 150～
    { gameMin: 160, gameMax: 169, expect: -972, expect460: -1116 },  // 160～
    { gameMin: 170, gameMax: 179, expect: -965, expect460: -1104 },  // 170～
    { gameMin: 180, gameMax: 189, expect: -920, expect460: -1057 },  // 180～
    { gameMin: 190, gameMax: 199, expect: -910, expect460: -1043 },  // 190～
    { gameMin: 200, gameMax: 209, expect: -890, expect460: -1019 },  // 200～
    { gameMin: 210, gameMax: 219, expect: -837, expect460: -963 },  // 210～
    { gameMin: 220, gameMax: 229, expect: -767, expect460: -891 },  // 220～
    { gameMin: 230, gameMax: 239, expect: -680, expect460: -801 },  // 230～
    { gameMin: 240, gameMax: 249, expect: -611, expect460: -730 },  // 240～
    { gameMin: 250, gameMax: 259, expect: -543, expect460: -659 },  // 250～
    { gameMin: 260, gameMax: 269, expect: -462, expect460: -576 },  // 260～
    { gameMin: 270, gameMax: 279, expect: -357, expect460: -470 },  // 270～
    { gameMin: 280, gameMax: 289, expect: -278, expect460: -389 },  // 280～
    { gameMin: 290, gameMax: 299, expect: -218, expect460: -326 },  // 290～
    { gameMin: 300, gameMax: 309, expect: -122, expect460: -229 },  // 300～
    { gameMin: 310, gameMax: 319, expect: -91, expect460: -195 },   // 310～
    { gameMin: 320, gameMax: 329, expect: -25, expect460: -127 },   // 320～
    { gameMin: 330, gameMax: 339, expect: 70, expect460: -30 },    // 330～
    { gameMin: 340, gameMax: 349, expect: 185, expect460: 86 },   // 340～
    { gameMin: 350, gameMax: 359, expect: 268, expect460: 170 },   // 350～
    { gameMin: 360, gameMax: 369, expect: 378, expect460: 281 },   // 360～
    { gameMin: 370, gameMax: 379, expect: 432, expect460: 337 },   // 370～
    { gameMin: 380, gameMax: 389, expect: 468, expect460: 376 },   // 380～
    { gameMin: 390, gameMax: 399, expect: 548, expect460: 456 },   // 390～
    { gameMin: 400, gameMax: 409, expect: 583, expect460: 494 },   // 400～
    { gameMin: 410, gameMax: 419, expect: 672, expect460: 583 },   // 410～
    { gameMin: 420, gameMax: 429, expect: 766, expect460: 678 },   // 420～
    { gameMin: 430, gameMax: 439, expect: 860, expect460: 772 },   // 430～
    { gameMin: 440, gameMax: 449, expect: 941, expect460: 854 },   // 440～
    { gameMin: 450, gameMax: 459, expect: 1003, expect460: 917 },  // 450～
    { gameMin: 460, gameMax: 469, expect: 1093, expect460: 1007 },  // 460～
    { gameMin: 470, gameMax: 479, expect: 1166, expect460: 1080 },  // 470～
    { gameMin: 480, gameMax: 489, expect: 1309, expect460: 1221 },  // 480～
    { gameMin: 490, gameMax: 499, expect: 1402, expect460: 1314 },  // 490～
    { gameMin: 500, gameMax: 509, expect: 1474, expect460: 1385 },  // 500～
    { gameMin: 510, gameMax: 519, expect: 1449, expect460: 1363 },  // 510～
    { gameMin: 520, gameMax: 529, expect: 1512, expect460: 1427 },  // 520～
    { gameMin: 530, gameMax: 539, expect: 1591, expect460: 1505 },  // 530～
    { gameMin: 540, gameMax: 549, expect: 1638, expect460: 1552 },  // 540～
    { gameMin: 550, gameMax: 559, expect: 1758, expect460: 1670 },  // 550～
    { gameMin: 560, gameMax: 569, expect: 1828, expect460: 1739 },  // 560～
    { gameMin: 570, gameMax: 579, expect: 1907, expect460: 1817 },  // 570～
    { gameMin: 580, gameMax: 589, expect: 1946, expect460: 1857 },  // 580～
    { gameMin: 590, gameMax: 599, expect: 1903, expect460: 1818 },  // 590～
    { gameMin: 600, gameMax: 609, expect: 2002, expect460: 1914 },  // 600～
    { gameMin: 610, gameMax: 619, expect: 2067, expect460: 1979 },  // 610～
    { gameMin: 620, gameMax: 629, expect: 2199, expect460: 2107 },  // 620～
    { gameMin: 630, gameMax: 639, expect: 2408, expect460: 2309 },  // 630～
    { gameMin: 640, gameMax: 649, expect: 2586, expect460: 2481 },  // 640～
    { gameMin: 650, gameMax: 659, expect: 2715, expect460: 2607 },  // 650～
    { gameMin: 660, gameMax: 669, expect: 2827, expect460: 2716 },  // 660～
    { gameMin: 670, gameMax: 679, expect: 2761, expect460: 2654 },  // 670～
    { gameMin: 680, gameMax: 689, expect: 2714, expect460: 2609 },  // 680～
    { gameMin: 690, gameMax: 699, expect: 2738, expect460: 2633 },  // 690～
    { gameMin: 700, gameMax: 709, expect: 2788, expect460: 2680 },  // 700～
    { gameMin: 710, gameMax: 719, expect: 2807, expect460: 2699 },  // 710～
    { gameMin: 720, gameMax: 729, expect: 2982, expect460: 2867 },  // 720～
    { gameMin: 730, gameMax: 739, expect: 3149, expect460: 3028 },  // 730～
    { gameMin: 740, gameMax: 749, expect: 3158, expect460: 3036 },  // 740～
    { gameMin: 750, gameMax: 759, expect: 3120, expect460: 3000 },  // 750～
    { gameMin: 760, gameMax: 769, expect: 3230, expect460: 3106 },  // 760～
    { gameMin: 770, gameMax: 779, expect: 3233, expect460: 3109 },  // 770～
    { gameMin: 780, gameMax: 789, expect: 3408, expect460: 3277 },  // 780～
    { gameMin: 790, gameMax: 799, expect: 3585, expect460: 3447 },  // 790～
    { gameMin: 800, gameMax: 809, expect: 3729, expect460: 3586 },  // 800～
    { gameMin: 810, gameMax: 819, expect: 3809, expect460: 3663 },  // 810～
    { gameMin: 820, gameMax: 829, expect: 4189, expect460: 4028 },  // 820～
    { gameMin: 830, gameMax: 839, expect: 4048, expect460: 3893 },  // 830～
    { gameMin: 840, gameMax: 849, expect: 3943, expect460: 3791 },  // 840～
    { gameMin: 850, gameMax: 859, expect: 3943, expect460: 3791 },  // 850～
    { gameMin: 860, gameMax: 869, expect: 4454, expect460: 4283 },  // 860～
    { gameMin: 870, gameMax: 879, expect: 4487, expect460: 4314 },  // 870～
    { gameMin: 880, gameMax: 889, expect: 4697, expect460: 4516 },  // 880～
    { gameMin: 890, gameMax: 899, expect: 4712, expect460: 4530 },  // 890～
    { gameMin: 900, gameMax: 999999, expect: 4461, expect460: 4289 } // 900～
];

// ヴァルブレイブ２「朝一以外前回枚数別ボーナス、AT間天井狙い」の期待値データ
// 差枚数カテゴリ別の期待値データ（50貸/50交換の期待値を使用）
const VALBRAVE2_ASAIGAI_MAISU_EXPECTATIONS = {
    'BIG後': [
        { gameMin: 80, gameMax: 89, expect: -1076, expect460: -1568 },
        { gameMin: 90, gameMax: 99, expect: -1072, expect460: -1562 },
        { gameMin: 100, gameMax: 109, expect: -1003, expect460: -1494 },
        { gameMin: 110, gameMax: 119, expect: -1095, expect460: -1582 },
        { gameMin: 120, gameMax: 129, expect: -1124, expect460: -1608 },
        { gameMin: 130, gameMax: 139, expect: -1151, expect460: -1630 },
        { gameMin: 140, gameMax: 149, expect: -1224, expect460: -1697 },
        { gameMin: 150, gameMax: 159, expect: -1332, expect460: -1797 },
        { gameMin: 160, gameMax: 169, expect: -1350, expect460: -1810 },
        { gameMin: 170, gameMax: 179, expect: -1336, expect460: -1793 },
        { gameMin: 180, gameMax: 189, expect: -1209, expect460: -1664 },
        { gameMin: 190, gameMax: 199, expect: -1267, expect460: -1713 },
        { gameMin: 200, gameMax: 209, expect: -1570, expect460: -2022 },
        { gameMin: 210, gameMax: 219, expect: -1478, expect460: -1927 },
        { gameMin: 220, gameMax: 229, expect: -1398, expect460: -1840 },
        { gameMin: 230, gameMax: 239, expect: -1322, expect460: -1762 },
        { gameMin: 240, gameMax: 249, expect: -1295, expect460: -1731 },
        { gameMin: 250, gameMax: 259, expect: -1280, expect460: -1712 },
        { gameMin: 260, gameMax: 269, expect: -1193, expect460: -1622 },
        { gameMin: 270, gameMax: 279, expect: -1177, expect460: -1602 },
        { gameMin: 280, gameMax: 289, expect: -1085, expect460: -1508 },
        { gameMin: 290, gameMax: 299, expect: -1087, expect460: -1508 },
        { gameMin: 300, gameMax: 309, expect: -1095, expect460: -1518 },
        { gameMin: 310, gameMax: 319, expect: -1252, expect460: -1669 },
        { gameMin: 320, gameMax: 329, expect: -1077, expect460: -1493 },
        { gameMin: 330, gameMax: 339, expect: -1055, expect460: -1465 },
        { gameMin: 340, gameMax: 349, expect: -1005, expect460: -1415 },
        { gameMin: 350, gameMax: 359, expect: -948, expect460: -1357 },
        { gameMin: 360, gameMax: 369, expect: -860, expect460: -1265 },
        { gameMin: 370, gameMax: 379, expect: -849, expect460: -1251 },
        { gameMin: 380, gameMax: 389, expect: -770, expect460: -1172 },
        { gameMin: 390, gameMax: 399, expect: -745, expect460: -1144 },
        { gameMin: 400, gameMax: 409, expect: -442, expect460: -846 },
        { gameMin: 410, gameMax: 419, expect: -592, expect460: -990 },
        { gameMin: 420, gameMax: 429, expect: -549, expect460: -943 },
        { gameMin: 430, gameMax: 439, expect: -434, expect460: -830 },
        { gameMin: 440, gameMax: 449, expect: -434, expect460: -830 },
        { gameMin: 450, gameMax: 459, expect: -518, expect460: -912 },
        { gameMin: 460, gameMax: 469, expect: -389, expect460: -783 },
        { gameMin: 470, gameMax: 479, expect: -424, expect460: -819 },
        { gameMin: 480, gameMax: 489, expect: -356, expect460: -750 },
        { gameMin: 490, gameMax: 499, expect: -196, expect460: -591 },
        { gameMin: 500, gameMax: 509, expect: -4, expect460: -383 },
        { gameMin: 510, gameMax: 519, expect: -14, expect460: -392 },
        { gameMin: 520, gameMax: 529, expect: -35, expect460: -416 },
        { gameMin: 530, gameMax: 539, expect: 95, expect460: -287 },
        { gameMin: 540, gameMax: 549, expect: -51, expect460: -427 },
        { gameMin: 550, gameMax: 559, expect: 73, expect460: -305 },
        { gameMin: 560, gameMax: 569, expect: 73, expect460: -308 },
        { gameMin: 570, gameMax: 579, expect: 268, expect460: -115 },
        { gameMin: 580, gameMax: 589, expect: 337, expect460: -43 },
        { gameMin: 590, gameMax: 599, expect: 315, expect460: -66 },
        { gameMin: 600, gameMax: 609, expect: 1824, expect460: 1431 },
        { gameMin: 610, gameMax: 619, expect: 1787, expect460: 1392 },
        { gameMin: 620, gameMax: 629, expect: 1786, expect460: 1387 },
        { gameMin: 630, gameMax: 639, expect: 1830, expect460: 1426 },
        { gameMin: 640, gameMax: 649, expect: 1743, expect460: 1337 },
        { gameMin: 650, gameMax: 659, expect: 2015, expect460: 1602 },
        { gameMin: 660, gameMax: 669, expect: 2035, expect460: 1626 },
        { gameMin: 670, gameMax: 679, expect: 2123, expect460: 1710 },
        { gameMin: 680, gameMax: 689, expect: 2078, expect460: 1664 },
        { gameMin: 690, gameMax: 699, expect: 1663, expect460: 1264 },
        { gameMin: 700, gameMax: 709, expect: 2749, expect460: 2356 },
        { gameMin: 710, gameMax: 719, expect: 1934, expect460: 1559 },
        { gameMin: 720, gameMax: 729, expect: 1643, expect460: 1280 },
        { gameMin: 730, gameMax: 739, expect: 1144, expect460: 791 },
        { gameMin: 740, gameMax: 749, expect: 1027, expect460: 671 },
        { gameMin: 750, gameMax: 759, expect: 1013, expect460: 653 },
        { gameMin: 760, gameMax: 769, expect: 581, expect460: 229 },
        { gameMin: 770, gameMax: 779, expect: 540, expect460: 189 },
        { gameMin: 780, gameMax: 789, expect: 569, expect460: 214 },
        { gameMin: 790, gameMax: 799, expect: 463, expect460: 101 },
        { gameMin: 800, gameMax: 809, expect: 272, expect460: -46 },
        { gameMin: 810, gameMax: 819, expect: 535, expect460: 203 },
        { gameMin: 820, gameMax: 829, expect: 213, expect460: -123 },
        { gameMin: 830, gameMax: 839, expect: -90, expect460: -419 },
        { gameMin: 840, gameMax: 849, expect: -179, expect460: -510 },
        { gameMin: 850, gameMax: 859, expect: -145, expect460: -479 },
        { gameMin: 860, gameMax: 869, expect: -66, expect460: -398 },
        { gameMin: 870, gameMax: 879, expect: 226, expect460: -106 },
        { gameMin: 880, gameMax: 889, expect: 234, expect460: -99 },
        { gameMin: 890, gameMax: 999999, expect: 379, expect460: 52 }
    ],
    '300枚以下後': [
        { gameMin: 80, gameMax: 89, expect: -1022, expect460: -1547 },
        { gameMin: 90, gameMax: 99, expect: -1044, expect460: -1567 },
        { gameMin: 100, gameMax: 109, expect: -1007, expect460: -1530 },
        { gameMin: 110, gameMax: 119, expect: -1012, expect460: -1533 },
        { gameMin: 120, gameMax: 129, expect: -1095, expect460: -1614 },
        { gameMin: 130, gameMax: 139, expect: -1093, expect460: -1609 },
        { gameMin: 140, gameMax: 149, expect: -1092, expect460: -1606 },
        { gameMin: 150, gameMax: 159, expect: -1170, expect460: -1683 },
        { gameMin: 160, gameMax: 169, expect: -1142, expect460: -1650 },
        { gameMin: 170, gameMax: 179, expect: -1157, expect460: -1660 },
        { gameMin: 180, gameMax: 189, expect: -1125, expect460: -1625 },
        { gameMin: 190, gameMax: 199, expect: -1059, expect460: -1555 },
        { gameMin: 200, gameMax: 209, expect: -1413, expect460: -1924 },
        { gameMin: 210, gameMax: 219, expect: -1362, expect460: -1869 },
        { gameMin: 220, gameMax: 229, expect: -1277, expect460: -1781 },
        { gameMin: 230, gameMax: 239, expect: -1203, expect460: -1701 },
        { gameMin: 240, gameMax: 249, expect: -1159, expect460: -1653 },
        { gameMin: 250, gameMax: 259, expect: -1080, expect460: -1569 },
        { gameMin: 260, gameMax: 269, expect: -1060, expect460: -1545 },
        { gameMin: 270, gameMax: 279, expect: -975, expect460: -1457 },
        { gameMin: 280, gameMax: 289, expect: -903, expect460: -1380 },
        { gameMin: 290, gameMax: 299, expect: -833, expect460: -1306 },
        { gameMin: 300, gameMax: 309, expect: -793, expect460: -1287 },
        { gameMin: 310, gameMax: 319, expect: -701, expect460: -1191 },
        { gameMin: 320, gameMax: 329, expect: -710, expect460: -1194 },
        { gameMin: 330, gameMax: 339, expect: -621, expect460: -1102 },
        { gameMin: 340, gameMax: 349, expect: -465, expect460: -944 },
        { gameMin: 350, gameMax: 359, expect: -363, expect460: -839 },
        { gameMin: 360, gameMax: 369, expect: -267, expect460: -740 },
        { gameMin: 370, gameMax: 379, expect: -247, expect460: -717 },
        { gameMin: 380, gameMax: 389, expect: -163, expect460: -630 },
        { gameMin: 390, gameMax: 399, expect: -71, expect460: -537 },
        { gameMin: 400, gameMax: 409, expect: 108, expect460: -353 },
        { gameMin: 410, gameMax: 419, expect: 234, expect460: -227 },
        { gameMin: 420, gameMax: 429, expect: 236, expect460: -221 },
        { gameMin: 430, gameMax: 439, expect: 312, expect460: -145 },
        { gameMin: 440, gameMax: 449, expect: 320, expect460: -133 },
        { gameMin: 450, gameMax: 459, expect: 234, expect460: -214 },
        { gameMin: 460, gameMax: 469, expect: 268, expect460: -176 },
        { gameMin: 470, gameMax: 479, expect: 300, expect460: -142 },
        { gameMin: 480, gameMax: 489, expect: 428, expect460: -13 },
        { gameMin: 490, gameMax: 499, expect: 521, expect460: 80 },
        { gameMin: 500, gameMax: 509, expect: 971, expect460: 522 },
        { gameMin: 510, gameMax: 519, expect: 1025, expect460: 579 },
        { gameMin: 520, gameMax: 529, expect: 1100, expect460: 658 },
        { gameMin: 530, gameMax: 539, expect: 976, expect460: 542 },
        { gameMin: 540, gameMax: 549, expect: 1095, expect460: 659 },
        { gameMin: 550, gameMax: 559, expect: 1191, expect460: 754 },
        { gameMin: 560, gameMax: 569, expect: 1273, expect460: 835 },
        { gameMin: 570, gameMax: 579, expect: 1337, expect460: 901 },
        { gameMin: 580, gameMax: 589, expect: 1343, expect460: 907 },
        { gameMin: 590, gameMax: 599, expect: 1241, expect460: 812 },
        { gameMin: 600, gameMax: 609, expect: 1722, expect460: 1287 },
        { gameMin: 610, gameMax: 619, expect: 1740, expect460: 1305 },
        { gameMin: 620, gameMax: 629, expect: 1696, expect460: 1263 },
        { gameMin: 630, gameMax: 639, expect: 1746, expect460: 1312 },
        { gameMin: 640, gameMax: 649, expect: 1900, expect460: 1462 },
        { gameMin: 650, gameMax: 659, expect: 1947, expect460: 1508 },
        { gameMin: 660, gameMax: 669, expect: 1818, expect460: 1384 },
        { gameMin: 670, gameMax: 679, expect: 1788, expect460: 1356 },
        { gameMin: 680, gameMax: 689, expect: 1484, expect460: 1062 },
        { gameMin: 690, gameMax: 699, expect: 1442, expect460: 1021 },
        { gameMin: 700, gameMax: 709, expect: 2045, expect460: 1623 },
        { gameMin: 710, gameMax: 719, expect: 2040, expect460: 1614 },
        { gameMin: 720, gameMax: 729, expect: 1844, expect460: 1428 },
        { gameMin: 730, gameMax: 739, expect: 2132, expect460: 1709 },
        { gameMin: 740, gameMax: 749, expect: 2025, expect460: 1602 },
        { gameMin: 750, gameMax: 759, expect: 1972, expect460: 1547 },
        { gameMin: 760, gameMax: 769, expect: 1321, expect460: 918 },
        { gameMin: 770, gameMax: 779, expect: 845, expect460: 450 },
        { gameMin: 780, gameMax: 789, expect: 864, expect460: 467 },
        { gameMin: 790, gameMax: 799, expect: 854, expect460: 461 },
        { gameMin: 800, gameMax: 809, expect: 3389, expect460: 3002 },
        { gameMin: 810, gameMax: 819, expect: 3736, expect460: 3333 },
        { gameMin: 820, gameMax: 829, expect: 3835, expect460: 3426 },
        { gameMin: 830, gameMax: 839, expect: 4007, expect460: 3595 },
        { gameMin: 840, gameMax: 849, expect: 3592, expect460: 3189 },
        { gameMin: 850, gameMax: 859, expect: 3351, expect460: 2962 },
        { gameMin: 860, gameMax: 869, expect: 3643, expect460: 3246 },
        { gameMin: 870, gameMax: 879, expect: 2070, expect460: 1712 },
        { gameMin: 880, gameMax: 889, expect: 2398, expect460: 2040 },
        { gameMin: 890, gameMax: 999999, expect: 2302, expect460: 1938 }
    ],
    '600-1000枚後': [
        { gameMin: 80, gameMax: 89, expect: -241, expect460: -729 },
        { gameMin: 90, gameMax: 99, expect: -206, expect460: -692 },
        { gameMin: 100, gameMax: 109, expect: -312, expect460: -794 },
        { gameMin: 110, gameMax: 119, expect: -392, expect460: -872 },
        { gameMin: 120, gameMax: 129, expect: -475, expect460: -953 },
        { gameMin: 130, gameMax: 139, expect: -567, expect460: -1043 },
        { gameMin: 140, gameMax: 149, expect: -650, expect460: -1124 },
        { gameMin: 150, gameMax: 159, expect: -769, expect460: -1240 },
        { gameMin: 160, gameMax: 169, expect: -784, expect460: -1253 },
        { gameMin: 170, gameMax: 179, expect: -750, expect460: -1217 },
        { gameMin: 180, gameMax: 189, expect: -648, expect460: -1115 },
        { gameMin: 190, gameMax: 199, expect: -639, expect460: -1103 },
        { gameMin: 200, gameMax: 209, expect: -1382, expect460: -1858 },
        { gameMin: 210, gameMax: 219, expect: -1346, expect460: -1816 },
        { gameMin: 220, gameMax: 229, expect: -1287, expect460: -1755 },
        { gameMin: 230, gameMax: 239, expect: -1156, expect460: -1623 },
        { gameMin: 240, gameMax: 249, expect: -1102, expect460: -1567 },
        { gameMin: 250, gameMax: 259, expect: -1002, expect460: -1464 },
        { gameMin: 260, gameMax: 269, expect: -926, expect460: -1384 },
        { gameMin: 270, gameMax: 279, expect: -873, expect460: -1329 },
        { gameMin: 280, gameMax: 289, expect: -921, expect460: -1373 },
        { gameMin: 290, gameMax: 299, expect: -877, expect460: -1326 },
        { gameMin: 300, gameMax: 309, expect: -1136, expect460: -1604 },
        { gameMin: 310, gameMax: 319, expect: -1131, expect460: -1593 },
        { gameMin: 320, gameMax: 329, expect: -1012, expect460: -1474 },
        { gameMin: 330, gameMax: 339, expect: -969, expect460: -1429 },
        { gameMin: 340, gameMax: 349, expect: -946, expect460: -1404 },
        { gameMin: 350, gameMax: 359, expect: -848, expect460: -1302 },
        { gameMin: 360, gameMax: 369, expect: -807, expect460: -1258 },
        { gameMin: 370, gameMax: 379, expect: -730, expect460: -1180 },
        { gameMin: 380, gameMax: 389, expect: -841, expect460: -1284 },
        { gameMin: 390, gameMax: 399, expect: -802, expect460: -1241 },
        { gameMin: 400, gameMax: 409, expect: -709, expect460: -1161 },
        { gameMin: 410, gameMax: 419, expect: -712, expect460: -1160 },
        { gameMin: 420, gameMax: 429, expect: -609, expect460: -1056 },
        { gameMin: 430, gameMax: 439, expect: -647, expect460: -1091 },
        { gameMin: 440, gameMax: 449, expect: -551, expect460: -993 },
        { gameMin: 450, gameMax: 459, expect: -469, expect460: -910 },
        { gameMin: 460, gameMax: 469, expect: -496, expect460: -935 },
        { gameMin: 470, gameMax: 479, expect: -374, expect460: -815 },
        { gameMin: 480, gameMax: 489, expect: -332, expect460: -772 },
        { gameMin: 490, gameMax: 499, expect: -383, expect460: -819 },
        { gameMin: 500, gameMax: 509, expect: -150, expect460: -577 },
        { gameMin: 510, gameMax: 519, expect: -252, expect460: -674 },
        { gameMin: 520, gameMax: 529, expect: -269, expect460: -688 },
        { gameMin: 530, gameMax: 539, expect: -297, expect460: -714 },
        { gameMin: 540, gameMax: 549, expect: -276, expect460: -692 },
        { gameMin: 550, gameMax: 559, expect: -108, expect460: -528 },
        { gameMin: 560, gameMax: 569, expect: -231, expect460: -649 },
        { gameMin: 570, gameMax: 579, expect: -148, expect460: -564 },
        { gameMin: 580, gameMax: 589, expect: -88, expect460: -503 },
        { gameMin: 590, gameMax: 599, expect: -281, expect460: -686 },
        { gameMin: 600, gameMax: 609, expect: 383, expect460: 18 },
        { gameMin: 610, gameMax: 619, expect: 439, expect460: 40 },
        { gameMin: 620, gameMax: 629, expect: 462, expect460: 64 },
        { gameMin: 630, gameMax: 639, expect: 615, expect460: 215 },
        { gameMin: 640, gameMax: 649, expect: 591, expect460: 192 },
        { gameMin: 650, gameMax: 659, expect: 707, expect460: 306 },
        { gameMin: 660, gameMax: 669, expect: 828, expect460: 424 },
        { gameMin: 670, gameMax: 679, expect: 526, expect460: 136 },
        { gameMin: 680, gameMax: 689, expect: 520, expect460: 133 },
        { gameMin: 690, gameMax: 699, expect: 513, expect460: 128 },
        { gameMin: 700, gameMax: 709, expect: 790, expect460: 416 },
        { gameMin: 710, gameMax: 719, expect: 730, expect460: 361 },
        { gameMin: 720, gameMax: 729, expect: 730, expect460: 357 },
        { gameMin: 730, gameMax: 739, expect: 670, expect460: 301 },
        { gameMin: 740, gameMax: 749, expect: 629, expect460: 262 },
        { gameMin: 750, gameMax: 759, expect: 300, expect460: -62 },
        { gameMin: 760, gameMax: 769, expect: 248, expect460: -112 },
        { gameMin: 770, gameMax: 779, expect: 243, expect460: -123 },
        { gameMin: 780, gameMax: 789, expect: 361, expect460: -11 },
        { gameMin: 790, gameMax: 799, expect: 249, expect460: -115 },
        { gameMin: 800, gameMax: 809, expect: 375, expect460: 46 },
        { gameMin: 810, gameMax: 819, expect: 400, expect460: 59 },
        { gameMin: 820, gameMax: 829, expect: 406, expect460: 66 },
        { gameMin: 830, gameMax: 839, expect: -227, expect460: -534 },
        { gameMin: 840, gameMax: 849, expect: -119, expect460: -425 },
        { gameMin: 850, gameMax: 859, expect: -526, expect460: -810 },
        { gameMin: 860, gameMax: 869, expect: -286, expect460: -568 },
        { gameMin: 870, gameMax: 879, expect: -66, expect460: -348 },
        { gameMin: 880, gameMax: 889, expect: -480, expect460: -745 },
        { gameMin: 890, gameMax: 999999, expect: -486, expect460: -749 }
    ],
    '1000-1500枚後': [
        { gameMin: 80, gameMax: 89, expect: 467, expect460: -15 },
        { gameMin: 90, gameMax: 99, expect: 505, expect460: 23 },
        { gameMin: 100, gameMax: 109, expect: 527, expect460: 48 },
        { gameMin: 110, gameMax: 119, expect: 560, expect460: 81 },
        { gameMin: 120, gameMax: 129, expect: 484, expect460: 7 },
        { gameMin: 130, gameMax: 139, expect: 417, expect460: -59 },
        { gameMin: 140, gameMax: 149, expect: 372, expect460: -101 },
        { gameMin: 150, gameMax: 159, expect: 433, expect460: -42 },
        { gameMin: 160, gameMax: 169, expect: 401, expect460: -74 },
        { gameMin: 170, gameMax: 179, expect: 472, expect460: -1 },
        { gameMin: 180, gameMax: 189, expect: 497, expect460: 26 },
        { gameMin: 190, gameMax: 199, expect: 603, expect460: 136 },
        { gameMin: 200, gameMax: 209, expect: 610, expect460: 130 },
        { gameMin: 210, gameMax: 219, expect: 614, expect460: 140 },
        { gameMin: 220, gameMax: 229, expect: 718, expect460: 246 },
        { gameMin: 230, gameMax: 239, expect: 810, expect460: 337 },
        { gameMin: 240, gameMax: 249, expect: 856, expect460: 388 },
        { gameMin: 250, gameMax: 259, expect: 833, expect460: 369 },
        { gameMin: 260, gameMax: 269, expect: 957, expect460: 493 },
        { gameMin: 270, gameMax: 279, expect: 977, expect460: 517 },
        { gameMin: 280, gameMax: 289, expect: 1025, expect460: 568 },
        { gameMin: 290, gameMax: 299, expect: 1007, expect460: 553 },
        { gameMin: 300, gameMax: 309, expect: 1070, expect460: 609 },
        { gameMin: 310, gameMax: 319, expect: 1087, expect460: 630 },
        { gameMin: 320, gameMax: 329, expect: 1177, expect460: 719 },
        { gameMin: 330, gameMax: 339, expect: 1305, expect460: 845 },
        { gameMin: 340, gameMax: 349, expect: 1387, expect460: 926 },
        { gameMin: 350, gameMax: 359, expect: 1386, expect460: 926 },
        { gameMin: 360, gameMax: 369, expect: 1374, expect460: 916 },
        { gameMin: 370, gameMax: 379, expect: 1475, expect460: 1016 },
        { gameMin: 380, gameMax: 389, expect: 1500, expect460: 1041 },
        { gameMin: 390, gameMax: 399, expect: 1383, expect460: 929 },
        { gameMin: 400, gameMax: 409, expect: 1148, expect460: 709 },
        { gameMin: 410, gameMax: 419, expect: 1394, expect460: 953 },
        { gameMin: 420, gameMax: 429, expect: 1546, expect460: 1101 },
        { gameMin: 430, gameMax: 439, expect: 1531, expect460: 1090 },
        { gameMin: 440, gameMax: 449, expect: 1668, expect460: 1228 },
        { gameMin: 450, gameMax: 459, expect: 1880, expect460: 1438 },
        { gameMin: 460, gameMax: 469, expect: 1962, expect460: 1521 },
        { gameMin: 470, gameMax: 479, expect: 2000, expect460: 1557 },
        { gameMin: 480, gameMax: 489, expect: 2146, expect460: 1704 },
        { gameMin: 490, gameMax: 499, expect: 2195, expect460: 1750 },
        { gameMin: 500, gameMax: 509, expect: 2839, expect460: 2387 },
        { gameMin: 510, gameMax: 519, expect: 2728, expect460: 2278 },
        { gameMin: 520, gameMax: 529, expect: 2952, expect460: 2496 },
        { gameMin: 530, gameMax: 539, expect: 2993, expect460: 2538 },
        { gameMin: 540, gameMax: 549, expect: 3217, expect460: 2757 },
        { gameMin: 550, gameMax: 559, expect: 3352, expect460: 2891 },
        { gameMin: 560, gameMax: 569, expect: 3399, expect460: 2932 },
        { gameMin: 570, gameMax: 579, expect: 3527, expect460: 3056 },
        { gameMin: 580, gameMax: 589, expect: 3790, expect460: 3309 },
        { gameMin: 590, gameMax: 599, expect: 3201, expect460: 2741 },
        { gameMin: 600, gameMax: 609, expect: 3911, expect460: 3422 },
        { gameMin: 610, gameMax: 619, expect: 3715, expect460: 3222 },
        { gameMin: 620, gameMax: 629, expect: 3913, expect460: 3407 },
        { gameMin: 630, gameMax: 639, expect: 4141, expect460: 3611 },
        { gameMin: 640, gameMax: 649, expect: 4287, expect460: 3750 },
        { gameMin: 650, gameMax: 659, expect: 4132, expect460: 3606 },
        { gameMin: 660, gameMax: 669, expect: 3728, expect460: 3221 },
        { gameMin: 670, gameMax: 679, expect: 3800, expect460: 3286 },
        { gameMin: 680, gameMax: 689, expect: 3894, expect460: 3368 },
        { gameMin: 690, gameMax: 699, expect: 4084, expect460: 3548 },
        { gameMin: 700, gameMax: 709, expect: 5262, expect460: 4749 },
        { gameMin: 710, gameMax: 719, expect: 5441, expect460: 4908 },
        { gameMin: 720, gameMax: 729, expect: 5453, expect460: 4926 },
        { gameMin: 730, gameMax: 739, expect: 6013, expect460: 5453 },
        { gameMin: 740, gameMax: 749, expect: 6111, expect460: 5534 },
        { gameMin: 750, gameMax: 759, expect: 6512, expect460: 5911 },
        { gameMin: 760, gameMax: 769, expect: 6678, expect460: 6059 },
        { gameMin: 770, gameMax: 779, expect: 7121, expect460: 6485 },
        { gameMin: 780, gameMax: 789, expect: 7242, expect460: 6595 },
        { gameMin: 790, gameMax: 799, expect: 7638, expect460: 6982 },
        { gameMin: 800, gameMax: 809, expect: 12119, expect460: 11349 },
        { gameMin: 810, gameMax: 819, expect: 12463, expect460: 11684 },
        { gameMin: 820, gameMax: 829, expect: 12938, expect460: 12124 },
        { gameMin: 830, gameMax: 839, expect: 13530, expect460: 12686 },
        { gameMin: 840, gameMax: 849, expect: 13836, expect460: 12996 },
        { gameMin: 850, gameMax: 859, expect: 15050, expect460: 14142 },
        { gameMin: 860, gameMax: 869, expect: 14589, expect460: 13688 },
        { gameMin: 870, gameMax: 879, expect: 14895, expect460: 13999 },
        { gameMin: 880, gameMax: 889, expect: 15864, expect460: 14918 },
        { gameMin: 890, gameMax: 999999, expect: 16169, expect460: 15231 }
    ],
    '1500-2000枚後': [
        { gameMin: 80, gameMax: 89, expect: -1121, expect460: -1722 },
        { gameMin: 90, gameMax: 99, expect: -1122, expect460: -1725 },
        { gameMin: 100, gameMax: 109, expect: -1086, expect460: -1693 },
        { gameMin: 110, gameMax: 119, expect: -1155, expect460: -1758 },
        { gameMin: 120, gameMax: 129, expect: -1120, expect460: -1719 },
        { gameMin: 130, gameMax: 139, expect: -973, expect460: -1569 },
        { gameMin: 140, gameMax: 149, expect: -860, expect460: -1450 },
        { gameMin: 150, gameMax: 159, expect: -729, expect460: -1314 },
        { gameMin: 160, gameMax: 169, expect: -613, expect460: -1193 },
        { gameMin: 170, gameMax: 179, expect: -478, expect460: -1055 },
        { gameMin: 180, gameMax: 189, expect: -706, expect460: -1275 },
        { gameMin: 190, gameMax: 199, expect: -537, expect460: -1103 },
        { gameMin: 200, gameMax: 209, expect: -401, expect460: -975 },
        { gameMin: 210, gameMax: 219, expect: -562, expect460: -1121 },
        { gameMin: 220, gameMax: 229, expect: -739, expect460: -1299 },
        { gameMin: 230, gameMax: 239, expect: -710, expect460: -1266 },
        { gameMin: 240, gameMax: 249, expect: -503, expect460: -1060 },
        { gameMin: 250, gameMax: 259, expect: -360, expect460: -912 },
        { gameMin: 260, gameMax: 269, expect: -182, expect460: -735 },
        { gameMin: 270, gameMax: 279, expect: -128, expect460: -675 },
        { gameMin: 280, gameMax: 289, expect: -235, expect460: -770 },
        { gameMin: 290, gameMax: 299, expect: -148, expect460: -687 },
        { gameMin: 300, gameMax: 309, expect: -63, expect460: -608 },
        { gameMin: 310, gameMax: 319, expect: 7, expect460: -544 },
        { gameMin: 320, gameMax: 329, expect: 174, expect460: -380 },
        { gameMin: 330, gameMax: 339, expect: 207, expect460: -356 },
        { gameMin: 340, gameMax: 349, expect: 390, expect460: -173 },
        { gameMin: 350, gameMax: 359, expect: 355, expect460: -209 },
        { gameMin: 360, gameMax: 369, expect: 561, expect460: 0 },
        { gameMin: 370, gameMax: 379, expect: 753, expect460: 192 },
        { gameMin: 380, gameMax: 389, expect: 639, expect460: 78 },
        { gameMin: 390, gameMax: 399, expect: 645, expect460: 91 },
        { gameMin: 400, gameMax: 409, expect: 1500, expect460: 937 },
        { gameMin: 410, gameMax: 419, expect: 1538, expect460: 971 },
        { gameMin: 420, gameMax: 429, expect: 1764, expect460: 1195 },
        { gameMin: 430, gameMax: 439, expect: 1512, expect460: 960 },
        { gameMin: 440, gameMax: 449, expect: 1587, expect460: 1031 },
        { gameMin: 450, gameMax: 459, expect: 1587, expect460: 1029 },
        { gameMin: 460, gameMax: 469, expect: 1830, expect460: 1267 },
        { gameMin: 470, gameMax: 479, expect: 1632, expect460: 1066 },
        { gameMin: 480, gameMax: 489, expect: 1757, expect460: 1193 },
        { gameMin: 490, gameMax: 499, expect: 2067, expect460: 1499 },
        { gameMin: 500, gameMax: 509, expect: 2755, expect460: 2195 },
        { gameMin: 510, gameMax: 519, expect: 1953, expect460: 1427 },
        { gameMin: 520, gameMax: 529, expect: 1801, expect460: 1280 },
        { gameMin: 530, gameMax: 539, expect: 2014, expect460: 1495 },
        { gameMin: 540, gameMax: 549, expect: 2278, expect460: 1757 },
        { gameMin: 550, gameMax: 559, expect: 2482, expect460: 1952 },
        { gameMin: 560, gameMax: 569, expect: 1913, expect460: 1396 },
        { gameMin: 570, gameMax: 579, expect: 1850, expect460: 1344 },
        { gameMin: 580, gameMax: 589, expect: 2070, expect460: 1569 },
        { gameMin: 590, gameMax: 599, expect: 2322, expect460: 1805 },
        { gameMin: 600, gameMax: 609, expect: 3189, expect460: 2688 },
        { gameMin: 610, gameMax: 619, expect: 2923, expect460: 2432 },
        { gameMin: 620, gameMax: 629, expect: 3006, expect460: 2515 },
        { gameMin: 630, gameMax: 639, expect: 3232, expect460: 2742 },
        { gameMin: 640, gameMax: 649, expect: 3546, expect460: 3047 },
        { gameMin: 650, gameMax: 659, expect: 3093, expect460: 2613 },
        { gameMin: 660, gameMax: 669, expect: 3095, expect460: 2608 },
        { gameMin: 670, gameMax: 679, expect: 3288, expect460: 2800 },
        { gameMin: 680, gameMax: 689, expect: 3495, expect460: 2995 },
        { gameMin: 690, gameMax: 699, expect: 3756, expect460: 3247 },
        { gameMin: 700, gameMax: 709, expect: 6588, expect460: 6056 },
        { gameMin: 710, gameMax: 719, expect: 6602, expect460: 6073 },
        { gameMin: 720, gameMax: 729, expect: 7003, expect460: 6460 },
        { gameMin: 730, gameMax: 739, expect: 6426, expect460: 5907 },
        { gameMin: 740, gameMax: 749, expect: 6732, expect460: 6213 },
        { gameMin: 750, gameMax: 759, expect: 5721, expect460: 5247 },
        { gameMin: 760, gameMax: 769, expect: 6026, expect460: 5552 },
        { gameMin: 770, gameMax: 779, expect: 6206, expect460: 5730 },
        { gameMin: 780, gameMax: 789, expect: 5263, expect460: 4820 },
        { gameMin: 790, gameMax: 799, expect: 5122, expect460: 4691 },
        { gameMin: 800, gameMax: 809, expect: 5534, expect460: 5104 },
        { gameMin: 810, gameMax: 819, expect: 6029, expect460: 5582 },
        { gameMin: 820, gameMax: 829, expect: 6224, expect460: 5754 },
        { gameMin: 830, gameMax: 839, expect: 5926, expect460: 5459 },
        { gameMin: 840, gameMax: 849, expect: 6513, expect460: 6024 },
        { gameMin: 850, gameMax: 859, expect: 6770, expect460: 6273 },
        { gameMin: 860, gameMax: 869, expect: 7614, expect460: 7074 },
        { gameMin: 870, gameMax: 879, expect: 7920, expect460: 7382 },
        { gameMin: 880, gameMax: 889, expect: 8183, expect460: 7635 },
        { gameMin: 890, gameMax: 999999, expect: 8408, expect460: 7851 }
    ],
    '2000-2500枚後': [
        { gameMin: 80, gameMax: 89, expect: -1706, expect460: -2378 },
        { gameMin: 90, gameMax: 99, expect: -1518, expect460: -2184 },
        { gameMin: 100, gameMax: 109, expect: -1213, expect460: -1895 },
        { gameMin: 110, gameMax: 119, expect: -1121, expect460: -1800 },
        { gameMin: 120, gameMax: 129, expect: -825, expect460: -1501 },
        { gameMin: 130, gameMax: 139, expect: -540, expect460: -1211 },
        { gameMin: 140, gameMax: 149, expect: -337, expect460: -1004 },
        { gameMin: 150, gameMax: 159, expect: -249, expect460: -906 },
        { gameMin: 160, gameMax: 169, expect: -312, expect460: -964 },
        { gameMin: 170, gameMax: 179, expect: -450, expect460: -1085 },
        { gameMin: 180, gameMax: 189, expect: -719, expect460: -1345 },
        { gameMin: 190, gameMax: 199, expect: -496, expect460: -1119 },
        { gameMin: 200, gameMax: 209, expect: -188, expect460: -825 },
        { gameMin: 210, gameMax: 219, expect: -58, expect460: -686 },
        { gameMin: 220, gameMax: 229, expect: -136, expect460: -754 },
        { gameMin: 230, gameMax: 239, expect: 167, expect460: -451 },
        { gameMin: 240, gameMax: 249, expect: 397, expect460: -217 },
        { gameMin: 250, gameMax: 259, expect: 661, expect460: 50 },
        { gameMin: 260, gameMax: 269, expect: 587, expect460: -19 },
        { gameMin: 270, gameMax: 279, expect: 778, expect460: 175 },
        { gameMin: 280, gameMax: 289, expect: 903, expect460: 301 },
        { gameMin: 290, gameMax: 299, expect: 644, expect460: 56 },
        { gameMin: 300, gameMax: 309, expect: 871, expect460: 317 },
        { gameMin: 310, gameMax: 319, expect: 966, expect460: 413 },
        { gameMin: 320, gameMax: 329, expect: 970, expect460: 418 },
        { gameMin: 330, gameMax: 339, expect: 1157, expect460: 606 },
        { gameMin: 340, gameMax: 349, expect: 1182, expect460: 636 },
        { gameMin: 350, gameMax: 359, expect: 1034, expect460: 498 },
        { gameMin: 360, gameMax: 369, expect: 1300, expect460: 763 },
        { gameMin: 370, gameMax: 379, expect: 1439, expect460: 894 },
        { gameMin: 380, gameMax: 389, expect: 1457, expect460: 918 },
        { gameMin: 390, gameMax: 399, expect: 1432, expect460: 895 },
        { gameMin: 400, gameMax: 409, expect: 1918, expect460: 1357 },
        { gameMin: 410, gameMax: 419, expect: 2106, expect460: 1538 },
        { gameMin: 420, gameMax: 429, expect: 1478, expect460: 934 },
        { gameMin: 430, gameMax: 439, expect: 1684, expect460: 1141 },
        { gameMin: 440, gameMax: 449, expect: 1901, expect460: 1356 },
        { gameMin: 450, gameMax: 459, expect: 1760, expect460: 1216 },
        { gameMin: 460, gameMax: 469, expect: 1989, expect460: 1447 },
        { gameMin: 470, gameMax: 479, expect: 2258, expect460: 1717 },
        { gameMin: 480, gameMax: 489, expect: 2545, expect460: 2000 },
        { gameMin: 490, gameMax: 499, expect: 2729, expect460: 2185 },
        { gameMin: 500, gameMax: 509, expect: 2992, expect460: 2430 },
        { gameMin: 510, gameMax: 519, expect: 3149, expect460: 2574 },
        { gameMin: 520, gameMax: 529, expect: 2033, expect460: 1492 },
        { gameMin: 530, gameMax: 539, expect: 2145, expect460: 1609 },
        { gameMin: 540, gameMax: 549, expect: 2150, expect460: 1608 },
        { gameMin: 550, gameMax: 559, expect: 2216, expect460: 1671 },
        { gameMin: 560, gameMax: 569, expect: 2111, expect460: 1558 },
        { gameMin: 570, gameMax: 579, expect: 2276, expect460: 1715 },
        { gameMin: 580, gameMax: 589, expect: 1617, expect460: 1071 },
        { gameMin: 590, gameMax: 599, expect: 1077, expect460: 549 },
        { gameMin: 600, gameMax: 609, expect: 1760, expect460: 1215 },
        { gameMin: 610, gameMax: 619, expect: 1903, expect460: 1352 },
        { gameMin: 620, gameMax: 629, expect: 1842, expect460: 1285 },
        { gameMin: 630, gameMax: 639, expect: 718, expect460: 211 },
        { gameMin: 640, gameMax: 649, expect: 1023, expect460: 520 },
        { gameMin: 650, gameMax: 659, expect: 506, expect460: 12 },
        { gameMin: 660, gameMax: 669, expect: 588, expect460: 88 },
        { gameMin: 670, gameMax: 679, expect: -860, expect460: -1307 },
        { gameMin: 680, gameMax: 689, expect: -835, expect460: -1286 },
        { gameMin: 690, gameMax: 699, expect: -548, expect460: -1014 },
        { gameMin: 700, gameMax: 709, expect: 1109, expect460: 669 },
        { gameMin: 710, gameMax: 719, expect: -53, expect460: -467 },
        { gameMin: 720, gameMax: 729, expect: 238, expect460: -184 },
        { gameMin: 730, gameMax: 739, expect: -78, expect460: -497 },
        { gameMin: 740, gameMax: 749, expect: 225, expect460: -201 },
        { gameMin: 750, gameMax: 759, expect: 531, expect460: 111 },
        { gameMin: 760, gameMax: 769, expect: -664, expect460: -1047 },
        { gameMin: 770, gameMax: 779, expect: -485, expect460: -873 },
        { gameMin: 780, gameMax: 789, expect: -661, expect460: -1038 },
        { gameMin: 790, gameMax: 799, expect: -2575, expect460: -2875 },
        { gameMin: 800, gameMax: 809, expect: 880, expect460: 662 },
        { gameMin: 810, gameMax: 819, expect: 1185, expect460: 968 },
        { gameMin: 820, gameMax: 829, expect: 1491, expect460: 1275 },
        { gameMin: 830, gameMax: 839, expect: 1797, expect460: 1582 },
        { gameMin: 840, gameMax: 849, expect: -1869, expect460: -1943 },
        { gameMin: 850, gameMax: 859, expect: -1738, expect460: -1820 },
        { gameMin: 860, gameMax: 869, expect: -1432, expect460: -1514 },
        { gameMin: 870, gameMax: 879, expect: -2845, expect460: -2915 },
        { gameMin: 880, gameMax: 889, expect: -2539, expect460: -2605 },
        { gameMin: 890, gameMax: 999999, expect: -2233, expect460: -2295 }
    ],
    '2500枚以上後': [
        { gameMin: 80, gameMax: 89, expect: -736, expect460: -1361 },
        { gameMin: 90, gameMax: 99, expect: -826, expect460: -1447 },
        { gameMin: 100, gameMax: 109, expect: -786, expect460: -1398 },
        { gameMin: 110, gameMax: 119, expect: -680, expect460: -1287 },
        { gameMin: 120, gameMax: 129, expect: -512, expect460: -1115 },
        { gameMin: 130, gameMax: 139, expect: -495, expect460: -1088 },
        { gameMin: 140, gameMax: 149, expect: -315, expect460: -904 },
        { gameMin: 150, gameMax: 159, expect: -181, expect460: -765 },
        { gameMin: 160, gameMax: 169, expect: -74, expect460: -653 },
        { gameMin: 170, gameMax: 179, expect: 33, expect460: -544 },
        { gameMin: 180, gameMax: 189, expect: 153, expect460: -421 },
        { gameMin: 190, gameMax: 199, expect: 162, expect460: -408 },
        { gameMin: 200, gameMax: 209, expect: 169, expect460: -409 },
        { gameMin: 210, gameMax: 219, expect: 232, expect460: -342 },
        { gameMin: 220, gameMax: 229, expect: -65, expect460: -624 },
        { gameMin: 230, gameMax: 239, expect: -197, expect460: -748 },
        { gameMin: 240, gameMax: 249, expect: 46, expect460: -502 },
        { gameMin: 250, gameMax: 259, expect: -197, expect460: -732 },
        { gameMin: 260, gameMax: 269, expect: -248, expect460: -776 },
        { gameMin: 270, gameMax: 279, expect: -52, expect460: -577 },
        { gameMin: 280, gameMax: 289, expect: 108, expect460: -415 },
        { gameMin: 290, gameMax: 299, expect: 163, expect460: -355 },
        { gameMin: 300, gameMax: 309, expect: 155, expect460: -360 },
        { gameMin: 310, gameMax: 319, expect: 184, expect460: -325 },
        { gameMin: 320, gameMax: 329, expect: 234, expect460: -271 },
        { gameMin: 330, gameMax: 339, expect: 361, expect460: -143 },
        { gameMin: 340, gameMax: 349, expect: 483, expect460: -19 },
        { gameMin: 350, gameMax: 359, expect: 651, expect460: 151 },
        { gameMin: 360, gameMax: 369, expect: 843, expect460: 343 },
        { gameMin: 370, gameMax: 379, expect: 932, expect460: 432 },
        { gameMin: 380, gameMax: 389, expect: 977, expect460: 476 },
        { gameMin: 390, gameMax: 399, expect: 1128, expect460: 627 },
        { gameMin: 400, gameMax: 409, expect: 1250, expect460: 808 },
        { gameMin: 410, gameMax: 419, expect: 1230, expect460: 786 },
        { gameMin: 420, gameMax: 429, expect: 1248, expect460: 804 },
        { gameMin: 430, gameMax: 439, expect: 1253, expect460: 810 },
        { gameMin: 440, gameMax: 449, expect: 1285, expect460: 841 },
        { gameMin: 450, gameMax: 459, expect: 1228, expect460: 783 },
        { gameMin: 460, gameMax: 469, expect: 1354, expect460: 908 },
        { gameMin: 470, gameMax: 479, expect: 1192, expect460: 755 },
        { gameMin: 480, gameMax: 489, expect: 1265, expect460: 825 },
        { gameMin: 490, gameMax: 499, expect: 1447, expect460: 1001 },
        { gameMin: 500, gameMax: 509, expect: 552, expect460: 127 },
        { gameMin: 510, gameMax: 519, expect: 319, expect460: -102 },
        { gameMin: 520, gameMax: 529, expect: 437, expect460: 15 },
        { gameMin: 530, gameMax: 539, expect: 659, expect460: 236 },
        { gameMin: 540, gameMax: 549, expect: 684, expect460: 262 },
        { gameMin: 550, gameMax: 559, expect: 727, expect460: 306 },
        { gameMin: 560, gameMax: 569, expect: 720, expect460: 301 },
        { gameMin: 570, gameMax: 579, expect: 355, expect460: -64 },
        { gameMin: 580, gameMax: 589, expect: 610, expect460: 183 },
        { gameMin: 590, gameMax: 599, expect: 883, expect460: 444 },
        { gameMin: 600, gameMax: 609, expect: 1735, expect460: 1315 },
        { gameMin: 610, gameMax: 619, expect: 1958, expect460: 1536 },
        { gameMin: 620, gameMax: 629, expect: 2207, expect460: 1781 },
        { gameMin: 630, gameMax: 639, expect: 2455, expect460: 2022 },
        { gameMin: 640, gameMax: 649, expect: 2520, expect460: 2081 },
        { gameMin: 650, gameMax: 659, expect: 2181, expect460: 1761 },
        { gameMin: 660, gameMax: 669, expect: 2198, expect460: 1780 },
        { gameMin: 670, gameMax: 679, expect: 2190, expect460: 1768 },
        { gameMin: 680, gameMax: 689, expect: 1962, expect460: 1547 },
        { gameMin: 690, gameMax: 699, expect: 2182, expect460: 1756 },
        { gameMin: 700, gameMax: 709, expect: 2401, expect460: 1963 },
        { gameMin: 710, gameMax: 719, expect: 2644, expect460: 2196 },
        { gameMin: 720, gameMax: 729, expect: 2881, expect460: 2425 },
        { gameMin: 730, gameMax: 739, expect: 2230, expect460: 1786 },
        { gameMin: 740, gameMax: 749, expect: 2085, expect460: 1626 },
        { gameMin: 750, gameMax: 759, expect: 1624, expect460: 1158 },
        { gameMin: 760, gameMax: 769, expect: 1930, expect460: 1466 },
        { gameMin: 770, gameMax: 779, expect: 2025, expect460: 1546 },
        { gameMin: 780, gameMax: 789, expect: 2015, expect460: 1525 },
        { gameMin: 790, gameMax: 799, expect: 2160, expect460: 1659 },
        { gameMin: 800, gameMax: 809, expect: -544, expect460: -915 },
        { gameMin: 810, gameMax: 819, expect: -415, expect460: -816 },
        { gameMin: 820, gameMax: 829, expect: -109, expect460: -506 },
        { gameMin: 830, gameMax: 839, expect: -3460, expect460: -3756 },
        { gameMin: 840, gameMax: 849, expect: -3155, expect460: -3445 },
        { gameMin: 850, gameMax: 859, expect: -3029, expect460: -3331 },
        { gameMin: 860, gameMax: 869, expect: -2723, expect460: -3019 },
        { gameMin: 870, gameMax: 879, expect: -3201, expect460: -3484 },
        { gameMin: 880, gameMax: 889, expect: -4063, expect460: -4319 },
        { gameMin: 890, gameMax: 999999, expect: -5979, expect460: -6239 }
    ]
};

// ヴァルブレイブ２「RB0回、CZ回数別AT間天井狙い詳細」の期待値データ
// RB回数とCZ回数の組み合わせごとの期待値データ（50貸/50交換の期待値を使用）
const VALBRAVE2_RB_CZ_EXPECTATIONS = {
    'RB0_CZ0': [
        { gameMin: 80, gameMax: 89, expect: -724, expect460: -1235 },
        { gameMin: 90, gameMax: 99, expect: -723, expect460: -1231 },
        { gameMin: 100, gameMax: 109, expect: -764, expect460: -1272 },
        { gameMin: 110, gameMax: 119, expect: -789, expect460: -1294 },
        { gameMin: 120, gameMax: 129, expect: -814, expect460: -1317 },
        { gameMin: 130, gameMax: 139, expect: -838, expect460: -1339 },
        { gameMin: 140, gameMax: 149, expect: -855, expect460: -1353 },
        { gameMin: 150, gameMax: 159, expect: -901, expect460: -1396 },
        { gameMin: 160, gameMax: 169, expect: -890, expect460: -1382 },
        { gameMin: 170, gameMax: 179, expect: -867, expect460: -1356 },
        { gameMin: 180, gameMax: 189, expect: -827, expect460: -1313 },
        { gameMin: 190, gameMax: 199, expect: -796, expect460: -1278 },
        { gameMin: 200, gameMax: 209, expect: -1139, expect460: -1636 },
        { gameMin: 210, gameMax: 219, expect: -1087, expect460: -1580 },
        { gameMin: 220, gameMax: 229, expect: -1022, expect460: -1511 },
        { gameMin: 230, gameMax: 239, expect: -936, expect460: -1422 },
        { gameMin: 240, gameMax: 249, expect: -871, expect460: -1354 },
        { gameMin: 250, gameMax: 259, expect: -819, expect460: -1298 },
        { gameMin: 260, gameMax: 269, expect: -756, expect460: -1231 },
        { gameMin: 270, gameMax: 279, expect: -683, expect460: -1156 },
        { gameMin: 280, gameMax: 289, expect: -637, expect460: -1106 },
        { gameMin: 290, gameMax: 299, expect: -614, expect460: -1081 },
        { gameMin: 300, gameMax: 309, expect: -635, expect460: -1113 },
        { gameMin: 310, gameMax: 319, expect: -623, expect460: -1097 },
        { gameMin: 320, gameMax: 329, expect: -577, expect460: -1048 },
        { gameMin: 330, gameMax: 339, expect: -504, expect460: -974 },
        { gameMin: 340, gameMax: 349, expect: -408, expect460: -876 },
        { gameMin: 350, gameMax: 359, expect: -344, expect460: -810 },
        { gameMin: 360, gameMax: 369, expect: -264, expect460: -728 },
        { gameMin: 370, gameMax: 379, expect: -236, expect460: -697 },
        { gameMin: 380, gameMax: 389, expect: -216, expect460: -675 },
        { gameMin: 390, gameMax: 399, expect: -188, expect460: -643 },
        { gameMin: 400, gameMax: 409, expect: 83, expect460: -373 },
        { gameMin: 410, gameMax: 419, expect: 127, expect460: -328 },
        { gameMin: 420, gameMax: 429, expect: 181, expect460: -272 },
        { gameMin: 430, gameMax: 439, expect: 237, expect460: -215 },
        { gameMin: 440, gameMax: 449, expect: 282, expect460: -168 },
        { gameMin: 450, gameMax: 459, expect: 295, expect460: -152 },
        { gameMin: 460, gameMax: 469, expect: 334, expect460: -112 },
        { gameMin: 470, gameMax: 479, expect: 351, expect460: -95 },
        { gameMin: 480, gameMax: 489, expect: 451, expect460: 6 },
        { gameMin: 490, gameMax: 499, expect: 499, expect460: 55 },
        { gameMin: 500, gameMax: 509, expect: 846, expect460: 402 },
        { gameMin: 510, gameMax: 519, expect: 793, expect460: 353 },
        { gameMin: 520, gameMax: 529, expect: 818, expect460: 381 },
        { gameMin: 530, gameMax: 539, expect: 854, expect460: 419 },
        { gameMin: 540, gameMax: 549, expect: 854, expect460: 421 },
        { gameMin: 550, gameMax: 559, expect: 905, expect460: 472 },
        { gameMin: 560, gameMax: 569, expect: 910, expect460: 477 },
        { gameMin: 570, gameMax: 579, expect: 946, expect460: 514 },
        { gameMin: 580, gameMax: 589, expect: 949, expect460: 518 },
        { gameMin: 590, gameMax: 599, expect: 861, expect460: 436 },
        { gameMin: 600, gameMax: 609, expect: 1387, expect460: 967 },
        { gameMin: 610, gameMax: 619, expect: 1392, expect460: 973 },
        { gameMin: 620, gameMax: 629, expect: 1446, expect460: 1025 },
        { gameMin: 630, gameMax: 639, expect: 1561, expect460: 1137 },
        { gameMin: 640, gameMax: 649, expect: 1586, expect460: 1163 },
        { gameMin: 650, gameMax: 659, expect: 1578, expect460: 1157 },
        { gameMin: 660, gameMax: 669, expect: 1560, expect460: 1139 },
        { gameMin: 670, gameMax: 679, expect: 1405, expect460: 992 },
        { gameMin: 680, gameMax: 689, expect: 1317, expect460: 907 },
        { gameMin: 690, gameMax: 699, expect: 1258, expect460: 849 },
        { gameMin: 700, gameMax: 709, expect: 1986, expect460: 1580 },
        { gameMin: 710, gameMax: 719, expect: 1896, expect460: 1491 },
        { gameMin: 720, gameMax: 729, expect: 1910, expect460: 1504 },
        { gameMin: 730, gameMax: 739, expect: 1944, expect460: 1536 },
        { gameMin: 740, gameMax: 749, expect: 1890, expect460: 1484 },
        { gameMin: 750, gameMax: 759, expect: 1746, expect460: 1341 },
        { gameMin: 760, gameMax: 769, expect: 1643, expect460: 1243 },
        { gameMin: 770, gameMax: 779, expect: 1536, expect460: 1135 },
        { gameMin: 780, gameMax: 789, expect: 1538, expect460: 1136 },
        { gameMin: 790, gameMax: 799, expect: 1510, expect460: 1111 },
        { gameMin: 800, gameMax: 809, expect: 2680, expect460: 2295 },
        { gameMin: 810, gameMax: 819, expect: 2451, expect460: 2069 },
        { gameMin: 820, gameMax: 829, expect: 2532, expect460: 2147 },
        { gameMin: 830, gameMax: 839, expect: 2224, expect460: 1850 },
        { gameMin: 840, gameMax: 849, expect: 1998, expect460: 1636 },
        { gameMin: 850, gameMax: 859, expect: 1968, expect460: 1612 },
        { gameMin: 860, gameMax: 869, expect: 2119, expect460: 1760 },
        { gameMin: 870, gameMax: 879, expect: 1907, expect460: 1555 },
        { gameMin: 880, gameMax: 889, expect: 1901, expect460: 1555 },
        { gameMin: 890, gameMax: 999999, expect: 1669, expect460: 1328 }
    ],
    'RB0_CZ1': [
        { gameMin: 250, gameMax: 259, expect: 730, expect460: 329 },
        { gameMin: 260, gameMax: 269, expect: 933, expect460: 531 },
        { gameMin: 270, gameMax: 279, expect: 896, expect460: 498 },
        { gameMin: 280, gameMax: 289, expect: 1072, expect460: 673 },
        { gameMin: 290, gameMax: 299, expect: 1114, expect460: 715 },
        { gameMin: 300, gameMax: 309, expect: 1055, expect460: 659 },
        { gameMin: 310, gameMax: 319, expect: 1005, expect460: 610 },
        { gameMin: 320, gameMax: 329, expect: 804, expect460: 414 },
        { gameMin: 330, gameMax: 339, expect: 656, expect460: 273 },
        { gameMin: 340, gameMax: 349, expect: 632, expect460: 251 },
        { gameMin: 350, gameMax: 359, expect: -1549, expect460: -2043 },
        { gameMin: 360, gameMax: 369, expect: -1384, expect460: -1874 },
        { gameMin: 370, gameMax: 379, expect: -1328, expect460: -1813 },
        { gameMin: 380, gameMax: 389, expect: -1164, expect460: -1647 },
        { gameMin: 390, gameMax: 399, expect: -1076, expect460: -1556 },
        { gameMin: 400, gameMax: 409, expect: -916, expect460: -1392 },
        { gameMin: 410, gameMax: 419, expect: -873, expect460: -1346 },
        { gameMin: 420, gameMax: 429, expect: -777, expect460: -1246 },
        { gameMin: 430, gameMax: 439, expect: -725, expect460: -1188 },
        { gameMin: 440, gameMax: 449, expect: -643, expect460: -1103 },
        { gameMin: 450, gameMax: 459, expect: -663, expect460: -1137 },
        { gameMin: 460, gameMax: 469, expect: -563, expect460: -1031 },
        { gameMin: 470, gameMax: 479, expect: -469, expect460: -937 },
        { gameMin: 480, gameMax: 489, expect: -381, expect460: -844 },
        { gameMin: 490, gameMax: 499, expect: -466, expect460: -923 },
        { gameMin: 500, gameMax: 509, expect: -439, expect460: -889 },
        { gameMin: 510, gameMax: 519, expect: -325, expect460: -772 },
        { gameMin: 520, gameMax: 529, expect: -277, expect460: -716 },
        { gameMin: 530, gameMax: 539, expect: -89, expect460: -528 },
        { gameMin: 540, gameMax: 549, expect: 105, expect460: -329 },
        { gameMin: 550, gameMax: 559, expect: -1256, expect460: -1747 },
        { gameMin: 560, gameMax: 569, expect: -1074, expect460: -1556 },
        { gameMin: 570, gameMax: 579, expect: -1039, expect460: -1522 },
        { gameMin: 580, gameMax: 589, expect: -916, expect460: -1395 },
        { gameMin: 590, gameMax: 599, expect: -722, expect460: -1200 },
        { gameMin: 600, gameMax: 609, expect: -690, expect460: -1158 },
        { gameMin: 610, gameMax: 619, expect: -691, expect460: -1153 },
        { gameMin: 620, gameMax: 629, expect: -623, expect460: -1082 },
        { gameMin: 630, gameMax: 639, expect: -410, expect460: -862 },
        { gameMin: 640, gameMax: 649, expect: -342, expect460: -788 },
        { gameMin: 650, gameMax: 659, expect: -1078, expect460: -1543 },
        { gameMin: 660, gameMax: 669, expect: -1039, expect460: -1498 },
        { gameMin: 670, gameMax: 679, expect: -1107, expect460: -1554 },
        { gameMin: 680, gameMax: 689, expect: -1104, expect460: -1539 },
        { gameMin: 690, gameMax: 699, expect: -1005, expect460: -1434 },
        { gameMin: 700, gameMax: 709, expect: -987, expect460: -1403 },
        { gameMin: 710, gameMax: 719, expect: -829, expect460: -1237 },
        { gameMin: 720, gameMax: 729, expect: -668, expect460: -1069 },
        { gameMin: 730, gameMax: 739, expect: -460, expect460: -856 },
        { gameMin: 740, gameMax: 749, expect: -569, expect460: -952 },
        { gameMin: 750, gameMax: 759, expect: -749, expect460: -1241 },
        { gameMin: 760, gameMax: 769, expect: -456, expect460: -941 },
        { gameMin: 770, gameMax: 779, expect: -374, expect460: -853 },
        { gameMin: 780, gameMax: 789, expect: -218, expect460: -690 },
        { gameMin: 790, gameMax: 799, expect: -341, expect460: -799 },
        { gameMin: 800, gameMax: 809, expect: -227, expect460: -680 },
        { gameMin: 810, gameMax: 819, expect: -50, expect460: -496 },
        { gameMin: 820, gameMax: 829, expect: -93, expect460: -523 },
        { gameMin: 830, gameMax: 839, expect: -183, expect460: -599 },
        { gameMin: 840, gameMax: 849, expect: 15, expect460: -393 },
        { gameMin: 850, gameMax: 859, expect: -1440, expect460: -1823 },
        { gameMin: 860, gameMax: 869, expect: -1431, expect460: -1798 },
        { gameMin: 870, gameMax: 879, expect: -1261, expect460: -1616 },
        { gameMin: 880, gameMax: 889, expect: -1097, expect460: -1442 },
        { gameMin: 890, gameMax: 899, expect: -1397, expect460: -1715 },
        { gameMin: 900, gameMax: 909, expect: -1732, expect460: -2038 },
        { gameMin: 910, gameMax: 919, expect: -1892, expect460: -2181 },
        { gameMin: 920, gameMax: 929, expect: -2332, expect460: -2599 },
        { gameMin: 930, gameMax: 939, expect: -2077, expect460: -2336 },
        { gameMin: 940, gameMax: 949, expect: -1781, expect460: -2031 },
        { gameMin: 950, gameMax: 959, expect: 2110, expect460: 1715 },
        { gameMin: 960, gameMax: 969, expect: 2416, expect460: 2031 },
        { gameMin: 970, gameMax: 979, expect: 2753, expect460: 2372 },
        { gameMin: 980, gameMax: 989, expect: 2675, expect460: 2308 },
        { gameMin: 990, gameMax: 999, expect: 2862, expect460: 2501 },
        { gameMin: 1000, gameMax: 1009, expect: 3222, expect460: 2866 },
        { gameMin: 1010, gameMax: 1019, expect: 2258, expect460: 1954 },
        { gameMin: 1020, gameMax: 1029, expect: 2456, expect460: 2164 },
        { gameMin: 1030, gameMax: 1039, expect: 2666, expect460: 2385 },
        { gameMin: 1040, gameMax: 1049, expect: 2972, expect460: 2701 },
        { gameMin: 1050, gameMax: 1059, expect: 3862, expect460: 3576 },
        { gameMin: 1060, gameMax: 1069, expect: 4305, expect460: 4014 },
        { gameMin: 1070, gameMax: 1079, expect: 4439, expect460: 4156 },
        { gameMin: 1080, gameMax: 1089, expect: 4944, expect460: 4654 },
        { gameMin: 1090, gameMax: 1099, expect: 4986, expect460: 4709 },
        { gameMin: 1100, gameMax: 1109, expect: 5291, expect460: 5021 },
        { gameMin: 1110, gameMax: 1119, expect: 5847, expect460: 5571 },
        { gameMin: 1120, gameMax: 1129, expect: 6069, expect460: 5798 },
        { gameMin: 1130, gameMax: 1139, expect: 6374, expect460: 6107 },
        { gameMin: 1140, gameMax: 999999, expect: 6680, expect460: 6415 }
    ],
    'RB0_CZ2': [
        { gameMin: 250, gameMax: 259, expect: 2146, expect460: 1788 },
        { gameMin: 260, gameMax: 269, expect: 2341, expect460: 1982 },
        { gameMin: 270, gameMax: 279, expect: 2535, expect460: 2171 },
        { gameMin: 280, gameMax: 289, expect: 2665, expect460: 2300 },
        { gameMin: 290, gameMax: 299, expect: 2614, expect460: 2250 },
        { gameMin: 300, gameMax: 309, expect: 2683, expect460: 2317 },
        { gameMin: 310, gameMax: 319, expect: 2586, expect460: 2222 },
        { gameMin: 320, gameMax: 329, expect: 2611, expect460: 2244 },
        { gameMin: 330, gameMax: 339, expect: 2626, expect460: 2258 },
        { gameMin: 340, gameMax: 349, expect: 2612, expect460: 2238 },
        { gameMin: 350, gameMax: 359, expect: 2066, expect460: 1716 },
        { gameMin: 360, gameMax: 369, expect: 2247, expect460: 1895 },
        { gameMin: 370, gameMax: 379, expect: 2326, expect460: 1975 },
        { gameMin: 380, gameMax: 389, expect: 2509, expect460: 2157 },
        { gameMin: 390, gameMax: 399, expect: 2587, expect460: 2235 },
        { gameMin: 400, gameMax: 409, expect: 2613, expect460: 2260 },
        { gameMin: 410, gameMax: 419, expect: 2694, expect460: 2335 },
        { gameMin: 420, gameMax: 429, expect: 2620, expect460: 2265 },
        { gameMin: 430, gameMax: 439, expect: 2300, expect460: 1953 },
        { gameMin: 440, gameMax: 449, expect: 1963, expect460: 1625 },
        { gameMin: 450, gameMax: 459, expect: -490, expect460: -843 },
        { gameMin: 460, gameMax: 469, expect: -361, expect460: -712 },
        { gameMin: 470, gameMax: 479, expect: -360, expect460: -710 },
        { gameMin: 480, gameMax: 489, expect: -264, expect460: -612 },
        { gameMin: 490, gameMax: 499, expect: -545, expect460: -876 },
        { gameMin: 500, gameMax: 509, expect: -494, expect460: -825 },
        { gameMin: 510, gameMax: 519, expect: -392, expect460: -722 },
        { gameMin: 520, gameMax: 529, expect: -277, expect460: -606 },
        { gameMin: 530, gameMax: 539, expect: -262, expect460: -585 },
        { gameMin: 540, gameMax: 549, expect: -12, expect460: -334 },
        { gameMin: 550, gameMax: 559, expect: 1377, expect460: 845 },
        { gameMin: 560, gameMax: 569, expect: 1571, expect460: 1039 },
        { gameMin: 570, gameMax: 579, expect: 1742, expect460: 1215 },
        { gameMin: 580, gameMax: 589, expect: 1766, expect460: 1245 },
        { gameMin: 590, gameMax: 599, expect: 1979, expect460: 1461 },
        { gameMin: 600, gameMax: 609, expect: 1942, expect460: 1428 },
        { gameMin: 610, gameMax: 619, expect: 1994, expect460: 1485 },
        { gameMin: 620, gameMax: 629, expect: 2031, expect460: 1531 },
        { gameMin: 630, gameMax: 639, expect: 2094, expect460: 1598 },
        { gameMin: 640, gameMax: 649, expect: 1759, expect460: 1278 },
        { gameMin: 650, gameMax: 659, expect: -187, expect460: -615 },
        { gameMin: 660, gameMax: 669, expect: 36, expect460: -391 },
        { gameMin: 670, gameMax: 679, expect: 5, expect460: -409 },
        { gameMin: 680, gameMax: 689, expect: 115, expect460: -296 },
        { gameMin: 690, gameMax: 699, expect: 132, expect460: -273 },
        { gameMin: 700, gameMax: 709, expect: 338, expect460: -61 },
        { gameMin: 710, gameMax: 719, expect: 280, expect460: -115 },
        { gameMin: 720, gameMax: 729, expect: 541, expect460: 149 },
        { gameMin: 730, gameMax: 739, expect: 712, expect460: 329 },
        { gameMin: 740, gameMax: 749, expect: 853, expect460: 476 },
        { gameMin: 750, gameMax: 759, expect: 1092, expect460: 682 },
        { gameMin: 760, gameMax: 769, expect: 865, expect460: 470 },
        { gameMin: 770, gameMax: 779, expect: 1079, expect460: 689 },
        { gameMin: 780, gameMax: 789, expect: 1255, expect460: 869 },
        { gameMin: 790, gameMax: 799, expect: 1526, expect460: 1145 },
        { gameMin: 800, gameMax: 809, expect: 1482, expect460: 1105 },
        { gameMin: 810, gameMax: 819, expect: 1582, expect460: 1214 },
        { gameMin: 820, gameMax: 829, expect: 1809, expect460: 1443 },
        { gameMin: 830, gameMax: 839, expect: 2035, expect460: 1671 },
        { gameMin: 840, gameMax: 849, expect: 2274, expect460: 1913 },
        { gameMin: 850, gameMax: 859, expect: 1484, expect460: 1152 },
        { gameMin: 860, gameMax: 869, expect: 1774, expect460: 1446 },
        { gameMin: 870, gameMax: 879, expect: 1753, expect460: 1438 },
        { gameMin: 880, gameMax: 889, expect: 1995, expect460: 1684 },
        { gameMin: 890, gameMax: 899, expect: 1988, expect460: 1689 },
        { gameMin: 900, gameMax: 909, expect: 2281, expect460: 1985 },
        { gameMin: 910, gameMax: 919, expect: 2286, expect460: 1998 },
        { gameMin: 920, gameMax: 929, expect: 2551, expect460: 2266 },
        { gameMin: 930, gameMax: 939, expect: 2771, expect460: 2490 },
        { gameMin: 940, gameMax: 949, expect: 2985, expect460: 2708 },
        { gameMin: 950, gameMax: 959, expect: 431, expect460: 184 },
        { gameMin: 960, gameMax: 969, expect: 690, expect460: 450 },
        { gameMin: 970, gameMax: 979, expect: 774, expect460: 545 },
        { gameMin: 980, gameMax: 989, expect: 998, expect460: 773 },
        { gameMin: 990, gameMax: 999, expect: 944, expect460: 736 },
        { gameMin: 1000, gameMax: 1009, expect: 1170, expect460: 965 },
        { gameMin: 1010, gameMax: 1019, expect: 986, expect460: 802 },
        { gameMin: 1020, gameMax: 1029, expect: 1128, expect460: 953 },
        { gameMin: 1030, gameMax: 1039, expect: 1395, expect460: 1225 },
        { gameMin: 1040, gameMax: 1049, expect: 1420, expect460: 1262 },
        { gameMin: 1050, gameMax: 1059, expect: 522, expect460: 366 },
        { gameMin: 1060, gameMax: 1069, expect: 643, expect460: 505 },
        { gameMin: 1070, gameMax: 1079, expect: 726, expect460: 604 },
        { gameMin: 1080, gameMax: 1089, expect: 954, expect460: 843 },
        { gameMin: 1090, gameMax: 1099, expect: 1260, expect460: 1154 },
        { gameMin: 1100, gameMax: 1109, expect: 1564, expect460: 1460 },
        { gameMin: 1110, gameMax: 1119, expect: 1869, expect460: 1767 },
        { gameMin: 1120, gameMax: 1129, expect: 2101, expect460: 2000 },
        { gameMin: 1130, gameMax: 1139, expect: 2407, expect460: 2302 },
        { gameMin: 1140, gameMax: 1149, expect: 2735, expect460: 2624 },
        { gameMin: 1150, gameMax: 1159, expect: 2467, expect460: 2370 },
        { gameMin: 1160, gameMax: 1169, expect: 2773, expect460: 2666 },
        { gameMin: 1170, gameMax: 1179, expect: 2915, expect460: 2803 },
        { gameMin: 1180, gameMax: 1189, expect: 3221, expect460: 3097 },
        { gameMin: 1190, gameMax: 1199, expect: 3337, expect460: 3208 },
        { gameMin: 1200, gameMax: 1209, expect: 3525, expect460: 3390 },
        { gameMin: 1210, gameMax: 1219, expect: 3790, expect460: 3644 },
        { gameMin: 1220, gameMax: 1229, expect: 4137, expect460: 3978 },
        { gameMin: 1230, gameMax: 1239, expect: 4443, expect460: 4272 },
        { gameMin: 1240, gameMax: 999999, expect: 4802, expect460: 4618 }
    ]
};

// ヴァルブレイブ２「朝一 CZ間天井狙い」の期待値データ（G数範囲と期待値）
// 50貸/50交換と460枚 46-52の期待値を使用
const VALBRAVE2_ASAICHI_CZ_EXPECTATIONS = [
    { gameMin: 1, gameMax: 9, expect: -660, expect460: -783 },      // 1～
    { gameMin: 10, gameMax: 19, expect: -749, expect460: -841 },    // 10～
    { gameMin: 20, gameMax: 29, expect: -838, expect460: -903 },    // 20～
    { gameMin: 30, gameMax: 39, expect: -697, expect460: -748 },    // 30～
    { gameMin: 40, gameMax: 49, expect: -297, expect460: -347 },     // 40～
    { gameMin: 50, gameMax: 59, expect: -33, expect460: -79 },     // 50～
    { gameMin: 60, gameMax: 69, expect: -16, expect460: -58 },     // 60～
    { gameMin: 70, gameMax: 79, expect: 66, expect460: 27 },      // 70～
    { gameMin: 80, gameMax: 89, expect: 174, expect460: 136 },     // 80～
    { gameMin: 90, gameMax: 99, expect: 351, expect460: 311 },     // 90～
    { gameMin: 100, gameMax: 109, expect: 459, expect460: 418 },   // 100～
    { gameMin: 110, gameMax: 119, expect: 609, expect460: 567 },   // 110～
    { gameMin: 120, gameMax: 129, expect: 745, expect460: 701 },   // 120～
    { gameMin: 130, gameMax: 139, expect: 799, expect460: 756 },   // 130～
    { gameMin: 140, gameMax: 149, expect: 850, expect460: 807 },   // 140～
    { gameMin: 150, gameMax: 159, expect: 1000, expect460: 954 },  // 150～
    { gameMin: 160, gameMax: 169, expect: 1082, expect460: 1034 },  // 160～
    { gameMin: 170, gameMax: 179, expect: 1208, expect460: 1157 },  // 170～
    { gameMin: 180, gameMax: 189, expect: 1263, expect460: 1212 },  // 180～
    { gameMin: 190, gameMax: 199, expect: 1379, expect460: 1324 },  // 190～
    { gameMin: 200, gameMax: 209, expect: 1467, expect460: 1410 },  // 200～
    { gameMin: 210, gameMax: 219, expect: 1529, expect460: 1470 },  // 210～
    { gameMin: 220, gameMax: 229, expect: 1646, expect460: 1583 },  // 220～
    { gameMin: 230, gameMax: 239, expect: 1796, expect460: 1727 },  // 230～
    { gameMin: 240, gameMax: 249, expect: 1950, expect460: 1875 },  // 240～
    { gameMin: 250, gameMax: 259, expect: 2233, expect460: 2147 },  // 250～
    { gameMin: 260, gameMax: 269, expect: 2443, expect460: 2349 },  // 260～
    { gameMin: 270, gameMax: 279, expect: 2741, expect460: 2635 },   // 270～
    { gameMin: 280, gameMax: 289, expect: 2892, expect460: 2781 },  // 280～
    { gameMin: 290, gameMax: 299, expect: 3070, expect460: 2952 },  // 290～
    { gameMin: 300, gameMax: 309, expect: 3207, expect460: 3083 },  // 300～
    { gameMin: 310, gameMax: 319, expect: 2901, expect460: 2789 },  // 310～
    { gameMin: 320, gameMax: 329, expect: 2844, expect460: 2734 },  // 320～
    { gameMin: 330, gameMax: 339, expect: 2929, expect460: 2817 },  // 330～
    { gameMin: 340, gameMax: 349, expect: 2932, expect460: 2820 },  // 340～
    { gameMin: 350, gameMax: 359, expect: 3361, expect460: 3231 },  // 350～
    { gameMin: 360, gameMax: 369, expect: 3309, expect460: 3182 },  // 360～
    { gameMin: 370, gameMax: 379, expect: 3542, expect460: 3406 },  // 370～
    { gameMin: 380, gameMax: 389, expect: 3595, expect460: 3457 },  // 380～
    { gameMin: 390, gameMax: 399, expect: 3456, expect460: 3323 },  // 390～
    { gameMin: 400, gameMax: 409, expect: 3359, expect460: 3230 },  // 400～
    { gameMin: 410, gameMax: 419, expect: 3111, expect460: 2991 },  // 410～
    { gameMin: 420, gameMax: 429, expect: 3415, expect460: 3283 },  // 420～
    { gameMin: 430, gameMax: 439, expect: 3274, expect460: 3148 },  // 430～
    { gameMin: 440, gameMax: 449, expect: 3575, expect460: 3437 },  // 440～
    { gameMin: 450, gameMax: 459, expect: 3600, expect460: 3461 },  // 450～
    { gameMin: 460, gameMax: 469, expect: 4114, expect460: 3956 },  // 460～
    { gameMin: 470, gameMax: 479, expect: 4301, expect460: 4136 },  // 470～
    { gameMin: 480, gameMax: 489, expect: 4420, expect460: 4250 },   // 480～
    { gameMin: 490, gameMax: 499, expect: 3816, expect460: 3669 },   // 490～
    { gameMin: 500, gameMax: 999999, expect: 3568, expect460: 3431 } // 500～
];

// マスターデータから選択肢を生成
function loadMasterData() {
    const masters = getMasterData();
    
    if (masters.length === 0) {
        // サンプルデータを追加（初回のみ）
        const sampleMasters = [
            { id: 1, machineName: '北斗の拳', target: 'ボーナス狙い', game: 1000, expect: 5000 },
            { id: 2, machineName: '北斗の拳', target: 'ボーナス狙い', game: 2000, expect: 10000 },
            { id: 3, machineName: '北斗の拳', target: 'ART狙い', game: 1000, expect: 3000 },
            { id: 4, machineName: 'パチスロ機種A', target: 'ボーナス狙い', game: 1000, expect: 4000 },
        ];
        saveMasterData(sampleMasters);
        loadMasterData();
        return;
    }
    
    // ユニークな機種名・ゲーム数のリストを取得
    const uniqueNames = [...new Set(masters.map(m => m.machineName))].sort();
    const uniqueGames = [...new Set(masters.map(m => m.game))].sort((a, b) => a - b);
    
    // 特定機種の狙い目リストが定義されている機種も選択肢に追加
    const specificMachineNames = Object.keys(MACHINE_SPECIFIC_TARGETS);
    specificMachineNames.forEach(name => {
        if (!uniqueNames.includes(name)) {
            uniqueNames.push(name);
        }
    });
    uniqueNames.sort();
    
    // 機種名の選択肢を生成
    const nameSelect = document.getElementById('name');
    uniqueNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        nameSelect.appendChild(option);
    });
    
    // 狙い目の選択肢は機種名に応じて動的に更新されるため、ここでは初期化のみ
    updateTargetOptions();
    
    // ゲーム数の選択肢も動的に更新
    updateGameOptions();
    
    // ヒントメッセージを更新
    updateHints(masters);
}

// 狙い目の選択肢を更新（機種名に応じて）
function updateTargetOptions() {
    const nameSelect = document.getElementById('name');
    const targetSelect = document.getElementById('target');
    const selectedMachine = nameSelect.value;
    
    // 既存の選択肢をクリア（最初の「選択してください」以外）
    while (targetSelect.children.length > 1) {
        targetSelect.removeChild(targetSelect.lastChild);
    }
    
    let targets = [];
    
    // 特定機種の場合は専用リストを使用
    if (selectedMachine && MACHINE_SPECIFIC_TARGETS[selectedMachine]) {
        targets = MACHINE_SPECIFIC_TARGETS[selectedMachine];
    } else {
        // それ以外の場合はマスターデータから取得
        const masters = getMasterData();
        // 選択された機種に限定して狙い目を取得
        if (selectedMachine) {
            targets = [...new Set(masters
                .filter(m => m.machineName === selectedMachine)
                .map(m => m.target)
            )].sort();
        } else {
            // 機種が選択されていない場合は全狙い目
            targets = [...new Set(masters.map(m => m.target))].sort();
        }
    }
    
    // 狙い目の選択肢を生成
    targets.forEach(target => {
        const option = document.createElement('option');
        option.value = target;
        option.textContent = target;
        targetSelect.appendChild(option);
    });
    
    // 狙い目が変更されたので期待値も再計算
    updateExpectation();
}

// 差枚数入力欄の表示/非表示を更新
function updateDifferenceField() {
    const nameSelect = document.getElementById('name');
    const targetSelect = document.getElementById('target');
    const differenceGroup = document.getElementById('differenceGroup');
    const differenceSelect = document.getElementById('difference');
    
    const selectedMachine = nameSelect.value;
    const selectedTarget = targetSelect.value;
    
    // 「朝一以外前回枚数別ボーナス、AT間天井狙い」の場合は差枚数欄を表示
    if (selectedMachine === 'ヴァルブレイブ２' && selectedTarget === '朝一以外前回枚数別ボーナス、AT間天井狙い') {
        differenceGroup.style.display = 'block';
        differenceSelect.required = true;
    } else {
        differenceGroup.style.display = 'none';
        differenceSelect.required = false;
        differenceSelect.value = '';
    }
}

// RB回数・CZ回数入力欄の表示/非表示を更新
function updateRBCZFields() {
    const nameSelect = document.getElementById('name');
    const targetSelect = document.getElementById('target');
    const rbGroup = document.getElementById('rbczGroup');
    const czGroup = document.getElementById('czGroup');
    const rbCountInput = document.getElementById('rbCount');
    const czCountInput = document.getElementById('czCount');
    
    const selectedMachine = nameSelect.value;
    const selectedTarget = targetSelect.value;
    
    // 「RB0回、CZ回数別AT間天井狙い詳細」系の場合はRB回数・CZ回数欄を表示
    if (selectedMachine === 'ヴァルブレイブ２' && 
        (selectedTarget === 'RB0回、CZ回数別AT間天井狙い詳細' ||
         selectedTarget === 'RB1回、CZ回数別AT間天井狙い詳細' ||
         selectedTarget === 'RB２回以上、CZ回数別AT間天井狙い詳細' ||
         selectedTarget === '朝一RB0回、CZ回数別AT間天井狙い詳細')) {
        rbGroup.style.display = 'block';
        czGroup.style.display = 'block';
        rbCountInput.required = true;
        czCountInput.required = true;
    } else {
        rbGroup.style.display = 'none';
        czGroup.style.display = 'none';
        rbCountInput.required = false;
        czCountInput.required = false;
        rbCountInput.value = '';
        czCountInput.value = '';
    }
}

// ゲーム数の選択肢を更新（機種名と狙い目に応じて）
function updateGameOptions() {
    const nameSelect = document.getElementById('name');
    const targetSelect = document.getElementById('target');
    const gameSelect = document.getElementById('game');
    const selectedMachine = nameSelect.value;
    const selectedTarget = targetSelect.value;
    
    // 既存の選択肢をクリア（最初の「選択してください」以外）
    while (gameSelect.children.length > 1) {
        gameSelect.removeChild(gameSelect.lastChild);
    }
    
    let gameRanges = [];
    
    // ヴァルブレイブ２「朝一以外前回枚数別ボーナス、AT間天井狙い」の場合は、期待値データからゲーム数範囲を生成
    if (selectedMachine === 'ヴァルブレイブ２' && selectedTarget === '朝一以外前回枚数別ボーナス、AT間天井狙い') {
        // 差枚数カテゴリごとの期待値データから、全範囲を取得
        const allRanges = new Set();
        Object.values(VALBRAVE2_ASAIGAI_MAISU_EXPECTATIONS).forEach(categoryData => {
            categoryData.forEach(range => {
                const rangeKey = `${range.gameMin}-${range.gameMax}`;
                if (!allRanges.has(rangeKey)) {
                    allRanges.add(rangeKey);
                    gameRanges.push({
                        text: range.gameMax >= 999999 ? `${range.gameMin}g～` : `${range.gameMin}g～${range.gameMax}g`,
                        value: `${range.gameMin}-${range.gameMax}`,
                        gameMin: range.gameMin,
                        gameMax: range.gameMax,
                        expect: null // 差枚数によって変わるため、ここでは設定しない
                    });
                }
            });
        });
        // 重複を除去してソート
        gameRanges = gameRanges.filter((range, index, self) => 
            index === self.findIndex(r => r.value === range.value)
        ).sort((a, b) => a.gameMin - b.gameMin);
    }
    // ヴァルブレイブ２「朝一以外 CZ間天井狙い」の場合は、期待値データからゲーム数範囲を生成
    else if (selectedMachine === 'ヴァルブレイブ２' && selectedTarget === '朝一以外 CZ間天井狙い') {
        // 期待値データから範囲を生成（「最小値～最大値」形式）
                VALBRAVE2_ASAIGAI_CZ_EXPECTATIONS.forEach(range => {
                    let rangeText;
                    if (range.gameMax >= 999999) {
                        // 最後の範囲（900以上）は「900g～」と表示
                        rangeText = `${range.gameMin}g～`;
                    } else {
                        rangeText = `${range.gameMin}g～${range.gameMax}g`;
                    }
            gameRanges.push({
                text: rangeText,
                value: `${range.gameMin}-${range.gameMax}`, // 内部値として範囲を保存
                gameMin: range.gameMin,
                gameMax: range.gameMax,
                expect: range.expect,
                expect460: range.expect460 || null
            });
        });
    }
    // ヴァルブレイブ２「RB0回、CZ回数別AT間天井狙い詳細」系の場合は、期待値データからゲーム数範囲を生成
    else if (selectedMachine === 'ヴァルブレイブ２' && 
             (selectedTarget === 'RB0回、CZ回数別AT間天井狙い詳細' ||
              selectedTarget === 'RB1回、CZ回数別AT間天井狙い詳細' ||
              selectedTarget === 'RB２回以上、CZ回数別AT間天井狙い詳細' ||
              selectedTarget === '朝一RB0回、CZ回数別AT間天井狙い詳細')) {
        // すべてのRB回数・CZ回数の組み合わせから、全範囲を取得
        const allRanges = new Set();
        Object.values(VALBRAVE2_RB_CZ_EXPECTATIONS).forEach(categoryData => {
            categoryData.forEach(range => {
                const rangeKey = `${range.gameMin}-${range.gameMax}`;
                if (!allRanges.has(rangeKey)) {
                    allRanges.add(rangeKey);
                    gameRanges.push({
                        text: range.gameMax >= 999999 ? `${range.gameMin}g～` : `${range.gameMin}g～${range.gameMax}g`,
                        value: `${range.gameMin}-${range.gameMax}`,
                        gameMin: range.gameMin,
                        gameMax: range.gameMax,
                        expect: null // RB回数・CZ回数によって変わるため、ここでは設定しない
                    });
                }
            });
        });
        // 重複を除去してソート
        gameRanges = gameRanges.filter((range, index, self) => 
            index === self.findIndex(r => r.value === range.value)
        ).sort((a, b) => a.gameMin - b.gameMin);
    }
    // 旧コード（削除予定）
    else if (false) {
        // 期待値データから範囲を生成（「最小値g～最大値g」形式）
        VALBRAVE2_RB0_CZ0_EXPECTATIONS.forEach(range => {
            let rangeText;
            if (range.gameMax >= 999999) {
                // 最後の範囲（890以上）は「890g～」と表示
                rangeText = `${range.gameMin}g～`;
            } else {
                rangeText = `${range.gameMin}g～${range.gameMax}g`;
            }
            gameRanges.push({
                text: rangeText,
                value: `${range.gameMin}-${range.gameMax}`, // 内部値として範囲を保存
                gameMin: range.gameMin,
                gameMax: range.gameMax,
                expect: null // RB回数・CZ回数によって変わるため、ここでは設定しない
            });
        });
    }
    // ヴァルブレイブ２「朝一 CZ間天井狙い」の場合は、期待値データからゲーム数範囲を生成
    else if (selectedMachine === 'ヴァルブレイブ２' && selectedTarget === '朝一 CZ間天井狙い') {
        // 期待値データから範囲を生成（「最小値～最大値」形式）
                VALBRAVE2_ASAICHI_CZ_EXPECTATIONS.forEach(range => {
                    let rangeText;
                    if (range.gameMax >= 999999) {
                        // 最後の範囲（500以上）は「500g～」と表示
                        rangeText = `${range.gameMin}g～`;
                    } else {
                        rangeText = `${range.gameMin}g～${range.gameMax}g`;
                    }
            gameRanges.push({
                text: rangeText,
                value: `${range.gameMin}-${range.gameMax}`, // 内部値として範囲を保存
                gameMin: range.gameMin,
                gameMax: range.gameMax,
                expect: range.expect,
                expect460: range.expect460 || null
            });
        });
    } else {
        // それ以外の場合はマスターデータから取得
        const masters = getMasterData();
        let games = [];
        if (selectedMachine && selectedTarget) {
            games = [...new Set(masters
                .filter(m => m.machineName === selectedMachine && m.target === selectedTarget)
                .map(m => m.game)
            )].sort((a, b) => a - b);
        } else if (selectedMachine) {
            games = [...new Set(masters
                .filter(m => m.machineName === selectedMachine)
                .map(m => m.game)
            )].sort((a, b) => a - b);
        } else {
            games = [...new Set(masters.map(m => m.game))].sort((a, b) => a - b);
        }
        
        // 通常のゲーム数を範囲形式に変換
        games.forEach(game => {
            gameRanges.push({
                text: `${game.toLocaleString()}g`,
                value: game.toString(),
                gameMin: game,
                gameMax: game,
                expect: null // マスターデータから取得
            });
        });
    }
    
    // ゲーム数の選択肢を生成
    gameRanges.forEach(range => {
        const option = document.createElement('option');
        option.value = range.value;
        option.textContent = range.text;
        // データ属性に範囲情報を保存
        option.setAttribute('data-game-min', range.gameMin);
        option.setAttribute('data-game-max', range.gameMax);
        if (range.expect !== null) {
            option.setAttribute('data-expect', range.expect);
        }
        if (range.expect460 !== null && range.expect460 !== undefined) {
            option.setAttribute('data-expect460', range.expect460);
        }
        gameSelect.appendChild(option);
    });
    
    // 差枚数欄の表示/非表示を更新
    updateDifferenceField();
    
    // RB回数・CZ回数欄の表示/非表示を更新
    updateRBCZFields();
    
    // ゲーム数が変更されたので期待値も再計算
    updateExpectation();
}

// ヒントメッセージを更新
function updateHints(masters) {
    const nameHint = document.getElementById('nameHint');
    const targetHint = document.getElementById('targetHint');
    const gameHint = document.getElementById('gameHint');
    
    if (masters.length === 0) {
        nameHint.textContent = 'マスターデータがありません';
        targetHint.textContent = 'マスターデータがありません';
        gameHint.textContent = 'マスターデータがありません';
    } else {
        nameHint.textContent = '';
        targetHint.textContent = '';
        gameHint.textContent = '';
    }
}

// 期待値を自動更新
function updateExpectation() {
    const name = document.getElementById('name').value;
    const target = document.getElementById('target').value;
    const gameSelect = document.getElementById('game');
    const gameValue = gameSelect.value;
    const expectInput = document.getElementById('expect');
    const expectHint = document.getElementById('expectHint');
    
    // RB回数・CZ回数が必要な場合のチェック
    const needsRBCZ = name === 'ヴァルブレイブ２' && 
        (target === 'RB0回、CZ回数別AT間天井狙い詳細' ||
         target === 'RB1回、CZ回数別AT間天井狙い詳細' ||
         target === 'RB２回以上、CZ回数別AT間天井狙い詳細' ||
         target === '朝一RB0回、CZ回数別AT間天井狙い詳細');
    
    if (!name || !target || !gameValue) {
        expectInput.value = '';
        const expectCurrency = document.getElementById('expectCurrency');
        if (expectCurrency) {
            expectCurrency.style.display = 'none';
        }
        expectHint.textContent = '';
        return;
    }
    
    // RB回数・CZ回数が必要な場合のチェック
    if (needsRBCZ) {
        const rbCount = document.getElementById('rbCount').value;
        const czCount = document.getElementById('czCount').value;
        if (!rbCount || !czCount) {
            expectInput.value = '';
            const expectCurrency = document.getElementById('expectCurrency');
            if (expectCurrency) {
                expectCurrency.style.display = 'none';
            }
            expectHint.textContent = '⚠ RB回数とCZ回数を入力してください';
            expectHint.className = 'form-hint warning';
            return;
        }
    }
    
    let matchedExpect = null;
    let matchedExpect50 = null; // 50貸/50交換の期待値
    let matchedExpect460 = null; // 460枚 46-52の期待値
    
    // 選択されたゲーム数範囲から期待値を取得
    const selectedOption = gameSelect.options[gameSelect.selectedIndex];
    if (selectedOption && selectedOption.hasAttribute('data-expect')) {
        // データ属性から期待値を直接取得（範囲形式の場合）
        matchedExpect = parseFloat(selectedOption.getAttribute('data-expect'));
        matchedExpect50 = matchedExpect; // 既存データは50貸/50交換として扱う
        matchedExpect460 = selectedOption.hasAttribute('data-expect460') ? 
            parseFloat(selectedOption.getAttribute('data-expect460')) : null; // 460枚 46-52の期待値があれば使用
    } else {
        // 通常のゲーム数（単一値）の場合
        const gameNum = parseInt(gameValue);
        
        // ヴァルブレイブ２「朝一以外前回枚数別ボーナス、AT間天井狙い」の特別処理
        if (name === 'ヴァルブレイブ２' && target === '朝一以外前回枚数別ボーナス、AT間天井狙い') {
            const difference = document.getElementById('difference').value;
            if (difference && VALBRAVE2_ASAIGAI_MAISU_EXPECTATIONS[difference]) {
                const rangeMatch = VALBRAVE2_ASAIGAI_MAISU_EXPECTATIONS[difference].find(range => 
                    gameNum >= range.gameMin && gameNum <= range.gameMax
                );
                if (rangeMatch) {
                    matchedExpect = rangeMatch.expect;
                    matchedExpect50 = rangeMatch.expect; // 既存データは50貸/50交換として扱う
                    matchedExpect460 = rangeMatch.expect460 || null; // 460枚 46-52の期待値があれば使用
                }
            }
        }
        // ヴァルブレイブ２「朝一以外 CZ間天井狙い」の特別処理
        else if (name === 'ヴァルブレイブ２' && target === '朝一以外 CZ間天井狙い') {
            const rangeMatch = VALBRAVE2_ASAIGAI_CZ_EXPECTATIONS.find(range => 
                gameNum >= range.gameMin && gameNum <= range.gameMax
            );
            if (rangeMatch) {
                matchedExpect = rangeMatch.expect;
                matchedExpect50 = rangeMatch.expect; // 既存データは50貸/50交換として扱う
                matchedExpect460 = rangeMatch.expect460 || null; // 460枚 46-52の期待値があれば使用
            }
        }
        // ヴァルブレイブ２「朝一 CZ間天井狙い」の特別処理
        else if (name === 'ヴァルブレイブ２' && target === '朝一 CZ間天井狙い') {
            const rangeMatch = VALBRAVE2_ASAICHI_CZ_EXPECTATIONS.find(range => 
                gameNum >= range.gameMin && gameNum <= range.gameMax
            );
            if (rangeMatch) {
                matchedExpect = rangeMatch.expect;
                matchedExpect50 = rangeMatch.expect; // 既存データは50貸/50交換として扱う
                matchedExpect460 = rangeMatch.expect460 || null; // 460枚 46-52の期待値があれば使用
            }
        }
        // ヴァルブレイブ２「RB0回、CZ回数別AT間天井狙い詳細」系の特別処理
        else if (name === 'ヴァルブレイブ２' && 
                 (target === 'RB0回、CZ回数別AT間天井狙い詳細' ||
                  target === 'RB1回、CZ回数別AT間天井狙い詳細' ||
                  target === 'RB２回以上、CZ回数別AT間天井狙い詳細' ||
                  target === '朝一RB0回、CZ回数別AT間天井狙い詳細')) {
            const rbCount = parseInt(document.getElementById('rbCount').value) || 0;
            const czCount = parseInt(document.getElementById('czCount').value) || 0;
            
            // RB回数とCZ回数の組み合わせでキーを生成
            const key = `RB${rbCount}_CZ${czCount}`;
            
            if (VALBRAVE2_RB_CZ_EXPECTATIONS[key]) {
                const rangeMatch = VALBRAVE2_RB_CZ_EXPECTATIONS[key].find(range => 
                    gameNum >= range.gameMin && gameNum <= range.gameMax
                );
                if (rangeMatch) {
                    matchedExpect = rangeMatch.expect;
                    matchedExpect50 = rangeMatch.expect; // 既存データは50貸/50交換として扱う
                    matchedExpect460 = rangeMatch.expect460 || null; // 460枚 46-52の期待値があれば使用
                }
            }
        }
        
        // マスターデータから該当する期待値を検索（特別処理で見つからなかった場合）
        if (matchedExpect === null) {
            const masters = getMasterData();
            const matched = masters.find(m => 
                m.machineName === name && 
                m.target === target && 
                m.game === gameNum
            );
            if (matched) {
                matchedExpect = matched.expect;
                matchedExpect50 = matched.expect; // 既存データは50貸/50交換として扱う
                matchedExpect460 = matched.expect460 || null; // 460枚 46-52の期待値があれば使用
            }
        }
    }
    
    // 表示用の期待値は50貸/50交換を使用（既存の動作を維持）
    const displayExpect = matchedExpect50 !== null ? matchedExpect50 : matchedExpect;
    
    if (displayExpect !== null) {
        expectInput.value = displayExpect;
        const expectCurrency = document.getElementById('expectCurrency');
        if (expectCurrency) {
            expectCurrency.style.display = 'inline';
        }
        
        // 期待値詳細表示（50貸/50交換と460枚 46-52）
        const expectDetails = document.getElementById('expectDetails');
        const expect50 = document.getElementById('expect50');
        const expect460 = document.getElementById('expect460');
        
        // 期待値詳細を表示（50貸/50交換は常に表示、460枚 46-52はあれば表示）
        if (matchedExpect50 !== null) {
            if (expectDetails) expectDetails.style.display = 'block';
            if (expect50) expect50.textContent = `¥${matchedExpect50.toLocaleString()}円`;
            if (expect460) {
                if (matchedExpect460 !== null) {
                    expect460.textContent = `¥${matchedExpect460.toLocaleString()}円`;
                } else {
                    expect460.textContent = 'データなし';
                }
            }
        } else {
            // 詳細データがない場合は非表示
            if (expectDetails) expectDetails.style.display = 'none';
        }
        
        expectHint.textContent = '✓ 期待値が自動設定されました';
        expectHint.className = 'form-hint success';
    } else {
        expectInput.value = '';
        const expectCurrency = document.getElementById('expectCurrency');
        if (expectCurrency) {
            expectCurrency.style.display = 'none';
        }
        const expectDetails = document.getElementById('expectDetails');
        if (expectDetails) {
            expectDetails.style.display = 'none';
        }
        expectHint.textContent = '⚠ 該当する期待値データが見つかりません';
        expectHint.className = 'form-hint warning';
    }
}

// フォーム送信処理
function handleFormSubmit(e) {
    e.preventDefault();
    
    const expectInput = document.getElementById('expect');
    if (!expectInput.value) {
        alert('機種名・狙い目・ゲーム数を選択して期待値を表示してください。');
        return;
    }
    
    // フォームデータ取得
    const name = document.getElementById('name').value.trim();
    const target = document.getElementById('target').value.trim();
    const gameSelect = document.getElementById('game');
    const gameValue = gameSelect.value;
    
    // ゲーム数範囲から実際のゲーム数を取得
    let game;
    if (gameValue.includes('-')) {
        // 範囲形式（例: "490-499"）の場合は最小値を使用
        game = parseInt(gameValue.split('-')[0]);
    } else {
        // 通常の単一値
        game = parseInt(gameValue);
    }
    
    const expect = parseFloat(document.getElementById('expect').value);
    const income = parseFloat(document.getElementById('income').value);
    const date = new Date().toLocaleDateString('ja-JP');
    
    // データ作成
    const newData = {
        id: Date.now(),
        name: name,
        target: target,
        game: game,
        expect: expect,
        income: income,
        date: date
    };
    
    // LocalStorageに保存
    const existingData = getStoredData();
    existingData.push(newData);
    saveData(existingData);
    
    // フォームリセット
    document.getElementById('registerForm').reset();
    document.getElementById('expectHint').textContent = '';
    document.getElementById('expectHint').className = 'form-hint';
    
    // 登録完了メッセージ
    const message = `スロット情報を登録しました！\n\n機種: ${name}\n狙い目: ${target}\nゲーム数: ${game.toLocaleString()}\n期待値: ¥${expect.toLocaleString()}円\n収支: ¥${income >= 0 ? '+' : ''}${income.toLocaleString()}円`;
    alert(message);
}

// LocalStorageからデータ取得
function getStoredData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// LocalStorageにデータ保存
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// マスターデータ取得
function getMasterData() {
    const data = localStorage.getItem(EXPECTATION_MASTER_KEY);
    return data ? JSON.parse(data) : [];
}

// マスターデータ保存
function saveMasterData(data) {
    localStorage.setItem(EXPECTATION_MASTER_KEY, JSON.stringify(data));
}

// カレンダー表示
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const monthElement = document.getElementById('calendarMonth');
    
    if (!calendar || !monthElement) return;
    
    // 月表示更新
    monthElement.textContent = `${currentYear}年${currentMonth + 1}月`;
    
    // カレンダー生成
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    // 日ごとの収支を集計
    const allData = getStoredData();
    const dailyIncome = {};
    
    allData.forEach(data => {
        const dateStr = data.date;
        if (!dailyIncome[dateStr]) {
            dailyIncome[dateStr] = 0;
        }
        dailyIncome[dateStr] += data.income;
    });
    
    // カレンダーHTML生成
    let calendarHTML = '<div class="calendar-header">';
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
    weekDays.forEach(day => {
        calendarHTML += `<div class="calendar-header-cell">${day}</div>`;
    });
    calendarHTML += '</div>';
    
    calendarHTML += '<div class="calendar-body">';
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateStr = currentDate.toLocaleDateString('ja-JP');
        const isCurrentMonth = currentDate.getMonth() === currentMonth;
        const dayIncome = dailyIncome[dateStr] || 0;
        
        calendarHTML += `
            <div class="calendar-day ${isCurrentMonth ? '' : 'other-month'}">
                <div class="calendar-day-number">${currentDate.getDate()}</div>
                ${dayIncome !== 0 ? `
                    <div class="calendar-day-income ${dayIncome >= 0 ? 'positive' : 'negative'}">
                        ¥${dayIncome >= 0 ? '+' : ''}${dayIncome.toLocaleString()}
                    </div>
                ` : ''}
            </div>
        `;
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    calendarHTML += '</div>';
    calendar.innerHTML = calendarHTML;
}

// 月切り替え
function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

// 日ごとの収支表示
function renderDailyStats() {
    const dailyStats = document.getElementById('dailyStats');
    if (!dailyStats) return;
    
    const allData = getStoredData();
    
    // 日ごとに集計
    const dailyIncome = {};
    allData.forEach(data => {
        if (!dailyIncome[data.date]) {
            dailyIncome[data.date] = 0;
        }
        dailyIncome[data.date] += data.income;
    });
    
    // 日付でソート（新しい順）
    const sortedDates = Object.keys(dailyIncome).sort((a, b) => {
        const dateA = new Date(a.replace(/\//g, '-'));
        const dateB = new Date(b.replace(/\//g, '-'));
        return dateB - dateA;
    });
    
    if (sortedDates.length === 0) {
        dailyStats.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">データがありません</p>';
        return;
    }
    
    dailyStats.innerHTML = sortedDates.map(date => {
        const income = dailyIncome[date];
        return `
            <div class="daily-stat-item">
                <div class="daily-stat-date">${date}</div>
                <div class="daily-stat-income ${income >= 0 ? 'positive' : 'negative'}">
                    ¥${income >= 0 ? '+' : ''}${income.toLocaleString()}
                </div>
            </div>
        `;
    }).join('');
}

// 統計情報更新
function updateStats() {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;
    
    const allData = getStoredData();
    
    // 合計期待値
    const totalExpect = allData.reduce((sum, data) => sum + data.expect, 0);
    // 合計収支
    const totalIncome = allData.reduce((sum, data) => sum + data.income, 0);
    // 総ゲーム数
    const totalGames = allData.reduce((sum, data) => sum + data.game, 0);
    
    statsGrid.innerHTML = `
        <div class="stat-item">
            <div class="stat-label">合計期待値</div>
            <div class="stat-value">¥${totalExpect.toLocaleString()}円</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">合計収支</div>
            <div class="stat-value ${totalIncome >= 0 ? 'positive' : 'negative'}">¥${totalIncome >= 0 ? '+' : ''}${totalIncome.toLocaleString()}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">総ゲーム数</div>
            <div class="stat-value">${totalGames.toLocaleString()}</div>
        </div>
    `;
}

// データインポート機能
function setupImport() {
    const importBtn = document.getElementById('importBtn');
    const clearBtn = document.getElementById('clearImportBtn');
    const importTextarea = document.getElementById('importData');
    const importResult = document.getElementById('importResult');
    
    if (!importBtn || !clearBtn || !importTextarea) return;
    
    importBtn.addEventListener('click', () => {
        const data = importTextarea.value.trim();
        if (!data) {
            showImportResult('データが入力されていません', 'warning');
            return;
        }
        
        try {
            const imported = parseImportData(data);
            if (imported.length === 0) {
                showImportResult('有効なデータが見つかりませんでした', 'warning');
                return;
            }
            
            // 既存データとマージ
            const existing = getMasterData();
            const merged = [...existing];
            let added = 0;
            let skipped = 0;
            
            imported.forEach(newItem => {
                // 重複チェック（機種名、狙い目、ゲーム数が同じもの）
                const isDuplicate = existing.some(item => 
                    item.machineName === newItem.machineName &&
                    item.target === newItem.target &&
                    item.game === newItem.game
                );
                
                if (!isDuplicate) {
                    merged.push(newItem);
                    added++;
                } else {
                    skipped++;
                }
            });
            
            saveMasterData(merged);
            loadMasterData();
            
            const message = `${added}件のデータを追加しました${skipped > 0 ? `（${skipped}件は重複のためスキップ）` : ''}`;
            showImportResult(message, 'success');
            importTextarea.value = '';
        } catch (error) {
            showImportResult(`エラー: ${error.message}`, 'error');
        }
    });
    
    clearBtn.addEventListener('click', () => {
        importTextarea.value = '';
        importResult.innerHTML = '';
    });
}

// インポートデータのパース
function parseImportData(data) {
    const results = [];
    
    // JSON形式かチェック
    if (data.trim().startsWith('[') || data.trim().startsWith('{')) {
        try {
            const json = JSON.parse(data);
            const items = Array.isArray(json) ? json : [json];
            
            items.forEach((item, index) => {
                if (item.machineName && item.target && item.game !== undefined && item.expect !== undefined) {
                    results.push({
                        id: Date.now() + index,
                        machineName: String(item.machineName).trim(),
                        target: String(item.target).trim(),
                        game: parseInt(item.game) || 0,
                        expect: parseFloat(item.expect) || 0
                    });
                }
            });
        } catch (e) {
            throw new Error('JSON形式が正しくありません');
        }
    } else {
        // CSV形式としてパース
        const lines = data.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            throw new Error('CSVデータが不足しています');
        }
        
        // ヘッダー行をスキップ（最初の行）
        const dataLines = lines.slice(1);
        
        dataLines.forEach((line, index) => {
            const parts = line.split(',').map(p => p.trim());
            if (parts.length >= 4) {
                const [machineName, target, game, expect] = parts;
                if (machineName && target && game && expect) {
                    results.push({
                        id: Date.now() + index,
                        machineName: machineName,
                        target: target,
                        game: parseInt(game) || 0,
                        expect: parseFloat(expect) || 0
                    });
                }
            }
        });
    }
    
    return results;
}

// インポート結果表示
function showImportResult(message, type) {
    const importResult = document.getElementById('importResult');
    if (!importResult) return;
    
    const colors = {
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--danger)'
    };
    
    importResult.innerHTML = `<div style="color: ${colors[type] || colors.success}; padding: 12px; background: rgba(20, 20, 20, 0.6); border-radius: 10px; border-left: 3px solid ${colors[type] || colors.success};">${message}</div>`;
    
    setTimeout(() => {
        importResult.innerHTML = '';
    }, 5000);
}

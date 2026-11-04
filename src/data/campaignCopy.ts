import {OpponentOrigin} from '../types';

/*
 * Per-chapter story copy and provenance. The career is a fictional, condensed run that starts in 2026; it is not the
 * real 2026 calendar and not the unpublished 2027 LCP format. Copy never names the opponent for chapters 3-12: from
 * season 2 (and for chapters 6-12 always) the opponent is a seeded Legacy team-year, so the name is shown from the
 * opponent object at render time. Rewards, formats, ids and seeds live elsewhere and are not touched here.
 * Reviewed against Esports_Manager_UpdatePack_2026-11-04 (campaign_copy_proposals.json).
 */
export interface ChapterCopy{subtitle:string;description?:string;storyEpilogue?:string;adaptationNote:string}

const HANDBOOK_2026='https://lolesports.com/en-US/season/115547545029543948/handbook';
const WORLDS_2026='https://lolesports.com/en-GB/news/worlds-2026-primer';

/** Cites the real-world page a chapter is loosely inspired by (rulesBasisYear is the year of that page). */
export const REFERENCE_RULES_YEAR=2026;
export const referenceUrlFor=(chapterId:number)=>chapterId>=10?WORLDS_2026:HANDBOOK_2026;

const SIMPLIFIED='Hành trình giả lập, rút gọn thành một chuỗi trận; không phải lịch hay thể thức chính thức.';

export const CHAPTER_COPY:Record<number,ChapterCopy>={
 1:{subtitle:'Chapter 1 · Giao Hữu Khởi Động',adaptationNote:'Trận giao hữu hư cấu của câu lạc bộ trong game.'},
 2:{subtitle:'Chapter 2 · Vòng Loại Đại Học',adaptationNote:'Giải sinh viên hư cấu; không dựa trên một giải thật.'},
 3:{subtitle:'Chapter 3 · Vòng Tuyển Chọn (giả lập)',
  description:'Vòng tuyển chọn Road to VCS trong cốt truyện giả lập: một chuỗi BO3 trước đội dày dạn kinh nghiệm, chuyên phòng ngự phản công. Đội hình của đối thủ là hư cấu.',
  storyEpilogue:'Vượt qua vòng tuyển chọn giả lập! Câu lạc bộ được mời bước vào chặng VCS của thế giới mô phỏng.',
  adaptationNote:`${SIMPLIFIED} Chiến thắng ở đây không bảo đảm quyền dự VCS ngoài đời thật.`},
 4:{subtitle:'Chapter 4 · Khởi Tranh VCS (giả lập)',
  description:'Trận mở màn chặng VCS trong cốt truyện giả lập. Áp lực ánh đèn sân khấu và nhịp độ giao tranh dồn dập. Đội hình đối thủ là hư cấu, không phải roster mùa 2026.',
  storyEpilogue:'Một màn trình diễn xuất thần! Đội tuyển ghi tên vào trận chung kết VCS của chiến dịch giả lập.',
  adaptationNote:`${SIMPLIFIED} Đội hình đối thủ là hư cấu.`},
 5:{subtitle:'Chapter 5 · Chung Kết VCS (giả lập)',
  description:'Trận BO5 cuối của chặng VCS trong cốt truyện giả lập. Danh hiệu mở khóa hành trình cạnh tranh tại APAC, không tự động bảo đảm suất LCP ngoài đời thật. Đối thủ là đội hình All-Star giả lập, không phải nhà vô địch VCS 2026.',
  storyEpilogue:'Vô địch chặng VCS trong chiến dịch! Câu lạc bộ chuẩn bị tranh tài ở các vòng tuyển chọn APAC của thế giới mô phỏng.',
  adaptationNote:`${SIMPLIFIED} Riot đã công bố từ 2027 mỗi split xét lại suất vào LCP từ VCS/PCS/LJL nhưng chưa công bố số suất; game không mô phỏng điều đó và không trao suất LCP thật.`},
 6:{subtitle:'Chapter 6 · LCP Showdown (giả lập)',
  description:'Bước vào một trận đối đầu APAC với đội hình lịch sử được chọn theo độ khó. Đây là chặng rút gọn của campaign, không phải bracket chính thức của LCP.',
  storyEpilogue:'Chiến thắng nâng danh tiếng của đội và mở khóa chặng quốc tế đầu mùa.',
  adaptationNote:`${SIMPLIFIED} Đối thủ là đội hình Legacy chọn theo độ khó, không phải roster LCP 2026.`},
 7:{subtitle:'Chapter 7 · First Stand Showcase (giả lập)',
  description:'Thử sức trong một trận BO5 ở sân chơi lấy cảm hứng First Stand, dùng đối thủ Legacy. Điều kiện chọn đại diện khu vực được giản lược.',
  storyEpilogue:'Đội rút ra kinh nghiệm từ một sân khấu quốc tế và tiến tới thử thách tiếp theo.',
  adaptationNote:`${SIMPLIFIED} Điều kiện tham dự giản lược; đối thủ là đội hình Legacy.`},
 8:{subtitle:'Chapter 8 · MSI Showcase (giả lập)',
  description:'Một trận BO5 mang tinh thần MSI với đội hình Legacy. Campaign chưa mô phỏng vòng loại Split 2.',
  storyEpilogue:'Bản lĩnh thi đấu quốc tế của câu lạc bộ tiếp tục được chứng minh.',
  adaptationNote:`${SIMPLIFIED} Điều kiện tham dự giản lược; đối thủ là đội hình Legacy.`},
 9:{subtitle:'Chapter 9 · LCP Cuối Mùa (giả lập)',
  description:'Trận quyết định cuối chặng APAC của campaign. Thể thức và suất Worlds được đơn giản hóa, không phải lịch chính thức.',
  storyEpilogue:'Câu lạc bộ hoàn tất hành trình APAC và bước vào vòng cuối của chiến dịch Worlds mô phỏng.',
  adaptationNote:`${SIMPLIFIED} Suất Worlds được đơn giản hóa; đối thủ là đội hình Legacy.`},
 10:{subtitle:'Chapter 10 · Tứ Kết Worlds (BO5 giả lập)',
  description:'Đối đầu đội hình Legacy ở vòng tứ kết BO5. Ở giải thật, các đội phải vượt qua Play-In và Swiss theo thể thức riêng trước vòng loại trực tiếp; game lược bỏ các vòng đó.',
  storyEpilogue:'Vượt qua tứ kết, đội bước tiếp vào bán kết Worlds mô phỏng.',
  adaptationNote:'Tứ kết BO5 giả lập. Worlds 2026 thật: Play-In, Swiss (BO1/BO3), rồi Knockout BO5; game không có Play-In hay Swiss.'},
 11:{subtitle:'Chapter 11 · Bán Kết Worlds (BO5 giả lập)',
  description:'Một trận bán kết BO5 với đội hình Legacy đã cân bằng độ khó.',
  storyEpilogue:'Đội tuyển giành vé đến trận chung kết của chiến dịch giả lập.',
  adaptationNote:'Bán kết BO5 giả lập; đối thủ là đội hình Legacy.'},
 12:{subtitle:'Chapter 12 · Chung Kết Worlds (BO5 giả lập)',
  description:'Trùm cuối là Gen.G phiên bản lịch sử do chế độ Legacy chọn. Đây không phải kết quả hay trận chung kết Worlds 2026 ngoài đời thật.',
  storyEpilogue:'Vô địch thế giới trong sự nghiệp giả lập! Mùa kế tiếp bắt đầu với đội hình đã tích lũy.',
  adaptationNote:'Chung kết BO5 giả lập; trùm cuối là đội hình Legacy, không phải kết quả Worlds 2026.'},
};

/** Chapters 1-4 use hand-written fictional rosters, chapter 5 an All-Star lineup, chapters 6-12 historical team-years. */
export const opponentOriginOf=(chapterId:number,season=1):OpponentOrigin=>
 chapterId>=6||(season>1&&chapterId>=3)?'LEGACY_ROSTER':chapterId===5?'LEGACY_ALLSTAR':'FICTIONAL_ROSTER';

export const OPPONENT_ORIGIN_LABELS:Record<OpponentOrigin,string>={
 FICTIONAL_ROSTER:'Đội hình hư cấu',
 LEGACY_ALLSTAR:'All-Star giả lập (không phải roster mùa 2026)',
 LEGACY_ROSTER:'Đội hình Legacy (lịch sử, không phải roster mùa 2026)',
};

/** Replaces the seed copy of chapter 5's rival so it is not read as the 2026 VCS champion. */
export const GAM_ALLSTAR_DESCRIPTION='Đội All-Star giả lập mang tên GAM Esports: các tuyển thủ từ nhiều thời kỳ, lối chơi cân bằng. Hư cấu, không phải đội hình hay nhà vô địch VCS 2026.';

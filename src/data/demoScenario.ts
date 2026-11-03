import {historicalTeam} from './legacyPool';

export const WORLD_CHAMPIONSHIP_DEMO_SCENARIO={
 title:'Chung Kết Thế Giới (Bản Trình Diễn)',
 subtitle:'Hai đội hình lịch sử 2024 · BO5 mô phỏng · khoảng 3 phút',
 description:'Dẫn dắt T1 2024 trước Bilibili Gaming 2024. Chọn ba pha ở ván đầu, một pha ở các ván sau. Kết quả và diễn biến do simulator tạo; mọi thao tác ở đây độc lập với sự nghiệp.',
 format:'BO5' as const,
 playerTeam:historicalTeam('t1',2024),opponentTeam:historicalTeam('blg',2024),opponentArchetype:'BALANCED' as const,
 rulesBasisYear:2024,isOfficialFormat:false,
 adaptationNote:'BO5 trình diễn dùng chỉ số được remap, không tái hiện diễn biến lịch sử. T1 thắng trận thật 3-2; mọi kết quả trong game là hư cấu.',
 realWorldReferenceUrl:'https://comcastspectacor.com/news/2024/11/t1-entertainment-sports-wins-riot-games-league-of-legends-world-championship/',
 confidence:'high' as const,retrievedAt:'2026-11-03',
};

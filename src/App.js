import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Menu, X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trash2, Edit2 } from 'lucide-react';

// ---------------------------------------------------------
// 1. Supabase 연결하기
// (방금 .env 파일에 넣었던 비밀번호를 여기서 불러와서 사용합니다)
// ---------------------------------------------------------
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 🌟 부족한 영양소별 추천 메뉴 데이터 (9개씩 컴팩트하게 구성, 영양성분 포함)
const RECOMMENDED_MENUS = {
  carbs: [
    { name: '고구마 닭가슴살 샐러드', desc: '복합 탄수화물이 풍부한 든든한 한 끼', recipe: '찐 고구마 1개, 닭가슴살 100g, 야채 믹스에 발사믹 드레싱을 곁들입니다.', cal: 280, carbs: 45, protein: 25, fat: 2 },
    { name: '통밀 파스타', desc: '식이섬유가 풍부한 건강한 면 요리', recipe: '통밀면 80g을 삶고, 마늘과 올리브유에 볶아 알리오올리오를 만듭니다.', cal: 350, carbs: 60, protein: 12, fat: 8 },
    { name: '오트밀 요거트 볼', desc: '간편하게 즐기는 훌륭한 탄수화물 간식', recipe: '플레인 요거트에 오트밀 한 줌, 견과류, 알룰로스를 섞어 먹습니다.', cal: 220, carbs: 35, protein: 8, fat: 6 },
    { name: '현미 닭죽', desc: '소화가 잘되는 따뜻한 탄수화물', recipe: '현미밥 1/2공기와 잘게 찢은 닭가슴살을 넣고 푹 끓여냅니다.', cal: 310, carbs: 50, protein: 20, fat: 3 },
    { name: '바나나 땅콩버터 샌드위치', desc: '에너지 보충에 탁월한 빠르고 맛있는 식단', recipe: '통밀빵 1쪽에 땅콩버터를 바르고 바나나 반 개를 썰어 올립니다.', cal: 290, carbs: 40, protein: 9, fat: 12 },
    { name: '단호박 찜', desc: '비타민과 탄수화물을 동시에 채우는 간식', recipe: '미니 단호박 반 개를 전자레인지에 5분간 쪄서 먹습니다.', cal: 150, carbs: 35, protein: 2, fat: 0 },
    { name: '퀴노아 샐러드', desc: '슈퍼푸드로 채우는 고급 탄수화물', recipe: '삶은 퀴노아 3스푼을 방울토마토, 양파와 함께 레몬즙에 버무립니다.', cal: 240, carbs: 42, protein: 8, fat: 5 },
    { name: '감자 에그 샌드위치', desc: '포만감이 오래가는 클래식한 조합', recipe: '으깬 삶은 감자와 계란을 저지방 마요네즈에 섞어 호밀빵에 넣습니다.', cal: 320, carbs: 45, protein: 14, fat: 10 },
    { name: '잡곡 주먹밥', desc: '바쁠 때 챙겨먹기 좋은 탄수화물', recipe: '잡곡밥 1공기에 멸치볶음을 넣고 뭉쳐서 김가루를 묻힙니다.', cal: 300, carbs: 55, protein: 10, fat: 4 }
  ],
  protein: [
    { name: '연어 스테이크', desc: '양질의 단백질과 오메가3가 풍부해요', recipe: '연어 150g을 에어프라이어에 180도 15분 굽고 레몬즙을 뿌립니다.', cal: 310, carbs: 0, protein: 30, fat: 20 },
    { name: '두부 버섯 볶음', desc: '식물성 단백질을 든든하게 채우는 반찬', recipe: '두부를 깍둑썰기하여 물기를 빼고, 표고버섯과 굴소스로 볶습니다.', cal: 210, carbs: 8, protein: 18, fat: 12 },
    { name: '소고기 우둔살 구이', desc: '지방이 적고 단백질이 꽉 찬 부위', recipe: '소고기 우둔살 150g을 후추와 약간의 소금으로 간을 하여 굽습니다.', cal: 250, carbs: 0, protein: 35, fat: 10 },
    { name: '그릭 요거트와 블루베리', desc: '디저트처럼 즐기는 고단백 간식', recipe: '꾸덕한 무가당 그릭 요거트 100g에 냉동 블루베리를 올립니다.', cal: 130, carbs: 12, protein: 10, fat: 4 },
    { name: '계란 참치 스크램블', desc: '구하기 쉬운 재료로 만드는 단백질 폭탄', recipe: '기름을 뺀 캔참치 반 캔과 계란 2개를 팬에 넣고 스크램블 합니다.', cal: 260, carbs: 2, protein: 30, fat: 14 },
    { name: '새우 마늘 볶음', desc: '맛있고 가볍게 채우는 해산물 단백질', recipe: '생새우 10마리를 편마늘과 함께 올리브유에 노릇하게 볶습니다.', cal: 180, carbs: 3, protein: 24, fat: 8 },
    { name: '오징어 숙회', desc: '타우린과 단백질이 가득한 피로회복 식단', recipe: '손질된 오징어를 끓는 물에 살짝 데쳐 초장에 살짝 찍어 먹습니다.', cal: 150, carbs: 2, protein: 28, fat: 2 },
    { name: '닭안심 텐더 오븐구이', desc: '닭가슴살이 질릴 때 먹는 부드러운 단백질', recipe: '닭안심에 빵가루를 얇게 묻혀 오븐이나 에어프라이어에 바삭하게 굽습니다.', cal: 240, carbs: 15, protein: 25, fat: 6 },
    { name: '프로틴 쉐이크 믹스', desc: '운동 직후 가장 빠르게 흡수되는 단백질', recipe: '단백질 보충제 1스쿱을 아몬드 브리즈 200ml에 타서 마십니다.', cal: 150, carbs: 5, protein: 25, fat: 2 }
  ],
  fat: [
    { name: '아보카도 명란 비빔밥', desc: '건강한 불포화지방산이 가득한 한 끼', recipe: '현미밥 1/2공기에 아보카도 반 개, 저염 명란젓, 계란 후라이를 올립니다.', cal: 380, carbs: 40, protein: 12, fat: 18 },
    { name: '견과류 샐러드', desc: '간단하게 좋은 지방을 섭취하기 좋아요', recipe: '양상추 샐러드에 호두, 아몬드 한 줌을 부수어 넣고 올리브유를 듬뿍 뿌립니다.', cal: 280, carbs: 10, protein: 5, fat: 25 },
    { name: '고등어 구이', desc: '등푸른 생선의 훌륭한 지방 섭취', recipe: '손질된 고등어 반 마리를 종이호일에 싸서 프라이팬에 노릇하게 굽습니다.', cal: 340, carbs: 0, protein: 24, fat: 26 },
    { name: '올리브유 토마토 카프레제', desc: '상큼하고 신선한 지방 보충 샐러드', recipe: '토마토와 생모짜렐라 치즈를 썰고 엑스트라버진 올리브유를 넉넉히 두릅니다.', cal: 260, carbs: 6, protein: 14, fat: 20 },
    { name: '무가당 피넛버터 사과', desc: '천연 지방과 비타민의 달콤한 조화', recipe: '사과 반 개를 얇게 썰어 무첨가 100% 땅콩버터를 조금씩 발라 먹습니다.', cal: 220, carbs: 20, protein: 6, fat: 14 },
    { name: '치아씨드 푸딩', desc: '오메가3가 가득한 다이어트 디저트', recipe: '치아씨드 2스푼을 코코넛 밀크에 넣고 냉장고에서 3시간 불려 먹습니다.', cal: 190, carbs: 12, protein: 4, fat: 15 },
    { name: '다크 초콜릿 (85%)', desc: '입터짐을 방지하는 건강한 식물성 지방', recipe: '카카오 함량 85% 이상의 다크 초콜릿 3조각을 천천히 녹여 먹습니다.', cal: 180, carbs: 10, protein: 2, fat: 14 },
    { name: '연어 뱃살 초밥 (3피스)', desc: '지방이 풍부한 연어 부위 활용', recipe: '밥양을 줄인 초밥 위에 두툼한 연어 뱃살을 얹어 생와사비와 즐깁니다.', cal: 210, carbs: 15, protein: 10, fat: 12 },
    { name: '베이컨 아스파라거스 말이', desc: '에너지 부스팅을 위한 키토제닉 식단', recipe: '아스파라거스에 얇은 베이컨을 말아 기름 없이 팬에 바싹 굽습니다.', cal: 270, carbs: 4, protein: 12, fat: 22 }
  ]
};

// 🌟 자주 먹는 대표 음식 데이터 (자동완성용)
const COMMON_FOODS = [
  { name: '햇반 (210g)', cal: 315, carbs: 70, protein: 5, fat: 1 },
  { name: '신라면 (1봉지)', cal: 500, carbs: 79, protein: 10, fat: 16 },
  { name: '닭가슴살 (100g)', cal: 109, carbs: 0, protein: 23, fat: 1 },
  { name: '사과 (1개)', cal: 130, carbs: 34, protein: 1, fat: 0 },
  { name: '바나나 (1개)', cal: 105, carbs: 27, protein: 1, fat: 0 },
  { name: '삶은 계란 (1개)', cal: 77, carbs: 1, protein: 6, fat: 5 }
];

export default function App() {
  // 앱에서 기억해야 할 상태(State)들입니다.
  const [session, setSession] = useState(null); // 현재 로그인한 사람의 정보
  const [email, setEmail] = useState('');       // 입력한 이메일
  const [password, setPassword] = useState(''); // 입력한 비밀번호
  const [loading, setLoading] = useState(false);// 로딩 중인지 여부
  
  // 새로 추가되는 UI 상태들
  const [activeTab, setActiveTab] = useState('today'); // 'today' 또는 'history'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 사이드바 열림/닫힘 상태

  const [diets, setDiets] = useState([]);       // 내 식단 목록
  const [newDiet, setNewDiet] = useState({      // 새로 입력할 식단 데이터
    food_name: '', calories: '', carbs: '', protein: '', fat: ''
  });
  const [showSuggestions, setShowSuggestions] = useState(false); // 자동완성 창 띄우기 여부
  const [editingId, setEditingId] = useState(null); // 수정 중인 식단의 고유 ID (없으면 null)

  // 달력 및 날짜 관련 상태
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const [currentMonth, setCurrentMonth] = useState(today); // 달력에서 현재 보는 달
  const [selectedDate, setSelectedDate] = useState(todayString); // 내가 클릭(선택)한 날짜

  // 프로필 관련 상태 추가
  const [profile, setProfile] = useState({ 
    nickname: '', birthdate: '', height: '', weight: '',
    target_cal: '', target_carbs: '', target_protein: '', target_fat: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false); // 수정 중인지 여부

  // 어플 크기 조절 상태 (기본값 100%)
  const [appScale, setAppScale] = useState(100);

  // 🌟 HTML 뿌리(root)의 폰트 크기를 조절하여 화면 전체 비율을 부드럽게(잘림 없이) 바꿉니다.
  useEffect(() => {
    document.documentElement.style.fontSize = `${appScale}%`;
  }, [appScale]);

  // ---------------------------------------------------------
  // 2. 처음 켜졌을 때 로그인 상태 확인하기
  // ---------------------------------------------------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchDiets();
        fetchProfile(session.user.id); 
        fetchFavorites(session.user.id); // 즐겨찾기 목록도 가져옵니다!
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchDiets();
        fetchProfile(session.user.id);
        fetchFavorites(session.user.id);
      }
    });
  }, []);

  // ---------------------------------------------------------
  // 3. 회원가입 및 로그인 / 로그아웃 기능
  // ---------------------------------------------------------
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
// 회원가입 할 때
const fakeEmail = email + "@mydietapp.com"; // email 변수에는 사용자가 입력한 '아이디'가 들어있다고 가정
const { data, error } = await supabase.auth.signUp({ email: fakeEmail, password });
    
    if (error) {
      alert("회원가입 실패: " + error.message);
    } else {
      alert("회원가입 성공! 환영합니다.");
      // 가입 성공 시 자동으로 data.session 안에 로그인 정보가 담겨서 들어옵니다.
      // useEffect가 자동으로 감지해서 화면을 넘겨주지만, 확실히 하기 위해 세션을 직접 넣어줍니다.
      if (data.session) setSession(data.session); 
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
// 로그인 할 때
const fakeEmail = email + "@mydietapp.com";
const { error } = await supabase.auth.signInWithPassword({ email: fakeEmail, password });
    if (error) alert("로그인 실패: " + error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDiets([]); // 로그아웃하면 화면에 보이던 식단도 지워줍니다.
  };

  // ---------------------------------------------------------
  // 4. 데이터베이스(Supabase)와 소통하기 (식단 & 프로필 & 즐겨찾기)
  // ---------------------------------------------------------
  const [favorites, setFavorites] = useState([]); // 자주 먹는 식단 목록
  const [showFavModal, setShowFavModal] = useState(false); // 저장된 식단 모달 창 상태
  const [editingFavId, setEditingFavId] = useState(null); // 모달 내에서 수정 중인 즐겨찾기 ID
  const [editFavData, setEditFavData] = useState({}); // 모달 내 수정 데이터
  const [selectedRecipe, setSelectedRecipe] = useState(null); // 클릭한 추천 메뉴의 상세 정보 모달 상태

  // 자주 먹는 식단 불러오기
  const fetchFavorites = async (userId) => {
    const { data } = await supabase.from('favorites').select('*').eq('user_id', userId);
    if (data) setFavorites(data);
  };

  // 자주 먹는 식단에 현재 입력값 추가하기
  const addFavorite = async () => {
    if (!newDiet.food_name || !newDiet.calories) return alert("음식 이름과 칼로리를 먼저 입력해주세요!");
    const { error } = await supabase.from('favorites').insert([{
      user_id: session.user.id, food_name: newDiet.food_name, 
      calories: parseInt(newDiet.calories) || 0, carbs: parseInt(newDiet.carbs) || 0, 
      protein: parseInt(newDiet.protein) || 0, fat: parseInt(newDiet.fat) || 0
    }]);
    
    if (error) alert("저장 실패: " + error.message);
    else {
      alert("⭐ 자주 먹는 식단으로 등록되었습니다!");
      fetchFavorites(session.user.id); // 등록 후 목록 새로고침
    }
  };

  // 즐겨찾기에서 삭제하기
  const removeFavorite = async (id, e) => {
    if (e) e.stopPropagation(); 
    if (!window.confirm("자주 먹는 식단에서 지울까요?")) return;
    const { error } = await supabase.from('favorites').delete().eq('id', id);
    if (!error) fetchFavorites(session.user.id);
  };

  // 🌟 모달창 내에서 즐겨찾기 데이터 바로 수정(저장)하기
  const updateFavorite = async (id) => {
    const { error } = await supabase.from('favorites').update({
      food_name: editFavData.food_name, calories: parseInt(editFavData.calories) || 0,
      carbs: parseInt(editFavData.carbs) || 0, protein: parseInt(editFavData.protein) || 0, fat: parseInt(editFavData.fat) || 0
    }).eq('id', id);
    
    if (error) alert("수정 실패: " + error.message);
    else {
      setEditingFavId(null); // 수정 모드 종료
      fetchFavorites(session.user.id); // 데이터 새로고침
    }
  };
  // 프로필 가져오기
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
    if (data) setProfile(data);
  };

  // 프로필 저장하기
  const saveProfile = async () => {
    setLoading(true);
    // 내 프로필이 이미 있는지 확인합니다.
    const { data: existing } = await supabase.from('profiles').select('user_id').eq('user_id', session.user.id).single();

    let error;
    if (existing) {
      // 이미 있으면 업데이트(수정)
      const res = await supabase.from('profiles').update({
        nickname: profile.nickname, birthdate: profile.birthdate, height: parseInt(profile.height) || 0, weight: parseInt(profile.weight) || 0,
        target_cal: parseInt(profile.target_cal) || 0, target_carbs: parseInt(profile.target_carbs) || 0, 
        target_protein: parseInt(profile.target_protein) || 0, target_fat: parseInt(profile.target_fat) || 0
      }).eq('user_id', session.user.id);
      error = res.error;
    } else {
      // 없으면 새로 만들기(삽입)
      const res = await supabase.from('profiles').insert([{
        user_id: session.user.id, nickname: profile.nickname, birthdate: profile.birthdate, height: parseInt(profile.height) || 0, weight: parseInt(profile.weight) || 0,
        target_cal: parseInt(profile.target_cal) || 0, target_carbs: parseInt(profile.target_carbs) || 0, 
        target_protein: parseInt(profile.target_protein) || 0, target_fat: parseInt(profile.target_fat) || 0
      }]);
      error = res.error;
    }

    setLoading(false);
    if (error) alert("프로필 저장 실패: " + error.message);
    else {
      alert("프로필이 성공적으로 저장되었습니다!");
      setIsEditingProfile(false); // 저장 후 읽기 모드로 변경
    }
  };
  // (읽기) 데이터 가져오기
  const fetchDiets = async () => {
    // 우리가 만든 'diets' 테이블에서 모든 데이터(*)를 가져옵니다.
    // (RLS 설정 덕분에 알아서 '나의 식단'만 가져옵니다!)
    const { data, error } = await supabase
      .from('diets')
      .select('*')
      .order('created_at', { ascending: false }); // 최신순으로 정렬
      
    if (error) console.log("데이터 가져오기 에러:", error);
    else setDiets(data);
  };

  // (쓰기 및 수정) 식단 저장하기
  const addDiet = async (e) => {
    e.preventDefault();
    if(!newDiet.food_name || !newDiet.calories || !newDiet.carbs || !newDiet.protein || !newDiet.fat) {
        return alert("모든 칸을 채워주세요!");
    }

    let error;
    if (editingId) {
      // 🌟 수정 모드일 때 (Update)
      const res = await supabase.from('diets')
        .update({
          food_name: newDiet.food_name, calories: parseInt(newDiet.calories),
          carbs: parseInt(newDiet.carbs), protein: parseInt(newDiet.protein), fat: parseInt(newDiet.fat)
        }).eq('id', editingId);
      error = res.error;
    } else {
      // 🌟 새 식단일 때 (Insert)
      const res = await supabase.from('diets')
        .insert([{
          food_name: newDiet.food_name, calories: parseInt(newDiet.calories),
          carbs: parseInt(newDiet.carbs), protein: parseInt(newDiet.protein),
          fat: parseInt(newDiet.fat), diet_date: selectedDate
        }]);
      error = res.error;
    }

    if (error) alert("저장 실패: " + error.message);
    else {
        fetchDiets(); 
        setNewDiet({ food_name: '', calories: '', carbs: '', protein: '', fat: '' });
        setEditingId(null); // 저장 완료 후 수정 모드 종료
    }
  };

  // (삭제) 식단 지우기
  const deleteDiet = async (id) => {
    // 실수로 지우는 것을 방지하기 위해 한 번 더 물어봅니다.
    if (!window.confirm("정말로 이 기록을 삭제할까요?")) return;
    
    const { error } = await supabase.from('diets').delete().eq('id', id);
    if (error) alert("삭제 실패: " + error.message);
    else fetchDiets(); // 삭제 후 목록 새로고침
  };

  // (수정 버튼 클릭 시) 입력창으로 데이터 불러오기
  const editDiet = (diet) => {
    setNewDiet({
      food_name: diet.food_name, calories: diet.calories, 
      carbs: diet.carbs, protein: diet.protein, fat: diet.fat
    });
    setEditingId(diet.id);
    setActiveTab('today'); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  // (초기화) 입력 폼 비우기
  const resetForm = () => {
    if (newDiet.food_name !== '' && !window.confirm("입력 중인 내용을 초기화하시겠습니까?")) return;
    setNewDiet({ food_name: '', calories: '', carbs: '', protein: '', fat: '' });
    setEditingId(null);
  };

  // --- 🌟 새롭게 추가된 달력 및 영양소 계산 로직 ---
  // 1. 선택된 날짜의 식단만 걸러내기 (diet_date가 없으면 예전 방식인 created_at 사용)
  const selectedDiets = diets.filter(diet => {
    const recordDate = diet.diet_date || diet.created_at.split('T')[0];
    return recordDate === selectedDate;
  });

  // 2. 걸러낸 식단의 영양소 합산하기
  const totalCal = selectedDiets.reduce((sum, diet) => sum + diet.calories, 0);
  const totalCarbs = selectedDiets.reduce((sum, diet) => sum + diet.carbs, 0);
  const totalProtein = selectedDiets.reduce((sum, diet) => sum + diet.protein, 0);
  const totalFat = selectedDiets.reduce((sum, diet) => sum + diet.fat, 0);

  // 3. 달력 그리기를 위한 날짜 계산식
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); 
  const daysInMonth = new Date(year, month + 1, 0).getDate(); 
  const emptyDays = Array(firstDay).fill(null); 
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1); 

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  // ---------------------------------------------------------
  // 5. 화면(UI) 그리기 (로그인 안 했을 때 화면)
  // ---------------------------------------------------------
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-sm w-full transform transition-all hover:scale-[1.01]">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🥗</div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">식단 기록장</h1>
            <p className="text-sm text-gray-500 mt-2 font-medium">나만의 스마트한 영양 파트너</p>
          </div>
          <form className="flex flex-col gap-4">
            <input 
              className="border border-gray-200 bg-gray-50 p-3.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
              type="email" 
              placeholder="이메일 (아이디)" 
              value={email} onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
              className="border border-gray-200 bg-gray-50 p-3.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
              type="password" 
              placeholder="비밀번호 (6자리 이상)" 
              value={password} onChange={(e) => setPassword(e.target.value)} 
            />
            <button 
              className="mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3.5 rounded-xl font-bold shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300"
              onClick={handleLogin} disabled={loading}
            >
              로그인 시작하기
            </button>
            <button 
              className="bg-gray-50 border border-gray-200 text-gray-600 p-3.5 rounded-xl font-bold hover:bg-gray-100 transition-colors"
              onClick={handleSignUp} disabled={loading}
            >
              이메일로 1초 만에 회원가입
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 6. 로그인 후 식단 기록 화면
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      {/* 모바일에서 화면 끝이 잘리지 않도록 여백을 확보한 메인 컨테이너입니다 */}
      <div className="max-w-3xl mx-auto pb-20">
        
        {/* 사이드바 (숨김/열림) */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setIsSidebarOpen(false)}></div>
        )}
        <div className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl flex flex-col`}>
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">설정</h2>
            <button onClick={() => setIsSidebarOpen(false)}><X className="text-gray-500 hover:text-gray-800" /></button>
          </div>
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* 🌟 로그인 정보 및 로그아웃 버튼 (사이드바 상단으로 이동) */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center shadow-sm">
              <span className="font-bold text-blue-800">{session.user.email.split('@')[0]}님</span>
              <button 
                onClick={handleLogout}
                className="text-xs bg-red-400 text-white px-3 py-1.5 rounded-lg hover:bg-red-500 shadow-sm transition font-bold"
              >
                로그아웃
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700">👤 프로필 정보</h3>
                {!isEditingProfile ? (
                  <button onClick={() => setIsEditingProfile(true)} className="text-xs text-blue-500 font-bold hover:underline">수정</button>
                ) : (
                  <button onClick={saveProfile} className="text-xs bg-blue-500 text-white px-2 py-1 rounded shadow hover:bg-blue-600">저장</button>
                )}
              </div>
              
              {isEditingProfile ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="text-xs text-gray-500 font-bold">닉네임</label>
                    <input className="w-full border p-1.5 rounded-lg mt-1" value={profile.nickname} onChange={e => setProfile({...profile, nickname: e.target.value})} placeholder="예: 헬스왕" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-bold">생년월일</label>
                    <input type="date" className="w-full border p-1.5 rounded-lg mt-1" value={profile.birthdate} onChange={e => setProfile({...profile, birthdate: e.target.value})} />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 font-bold">키 (cm)</label>
                      <input type="number" className="w-full border p-1.5 rounded-lg mt-1" value={profile.height} onChange={e => setProfile({...profile, height: e.target.value})} placeholder="170" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 font-bold">몸무게 (kg)</label>
                      <input type="number" className="w-full border p-1.5 rounded-lg mt-1" value={profile.weight} onChange={e => setProfile({...profile, weight: e.target.value})} placeholder="65" />
                    </div>
                  </div>
                  
                  {/* 🌟 목표 영양소 입력 및 자동 계산 버튼 */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs text-gray-500 font-bold">하루 목표량 (수동 입력 가능)</label>
                      <button 
                        type="button"
                        onClick={() => {
                          if (!profile.height || !profile.weight) return alert("키와 몸무게를 먼저 입력해주세요!");
                          // 기초대사량(Mifflin-St Jeor) 및 활동대사량 단순 계산
                          const bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * 30) + 5; // 30세 남성 기준 단순화
                          const tdee = Math.round(bmr * 1.5); // 활동량 보통
                          setProfile({
                            ...profile, 
                            target_cal: tdee, 
                            target_carbs: Math.round((tdee * 0.5) / 4), 
                            target_protein: Math.round((tdee * 0.3) / 4), 
                            target_fat: Math.round((tdee * 0.2) / 9)
                          });
                        }}
                        className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-200 font-bold"
                      >
                        체형 기반 자동 계산
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <input type="number" className="border p-1.5 rounded-lg text-xs" placeholder="칼로리(kcal)" value={profile.target_cal} onChange={e => setProfile({...profile, target_cal: e.target.value})} />
                       <input type="number" className="border p-1.5 rounded-lg text-xs" placeholder="탄수화물(g)" value={profile.target_carbs} onChange={e => setProfile({...profile, target_carbs: e.target.value})} />
                       <input type="number" className="border p-1.5 rounded-lg text-xs" placeholder="단백질(g)" value={profile.target_protein} onChange={e => setProfile({...profile, target_protein: e.target.value})} />
                       <input type="number" className="border p-1.5 rounded-lg text-xs" placeholder="지방(g)" value={profile.target_fat} onChange={e => setProfile({...profile, target_fat: e.target.value})} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 text-sm text-gray-600">
                  <p><span className="font-bold text-gray-400">닉네임:</span> {profile.nickname || '미입력'}</p>
                  <p><span className="font-bold text-gray-400">키/몸무게:</span> {profile.height ? `${profile.height}cm` : '-'} / {profile.weight ? `${profile.weight}kg` : '-'}</p>
                  <p className="mt-2 pt-2 border-t font-bold text-indigo-500">🔥 하루 목표</p>
                  <p className="text-xs"><span className="text-gray-400">칼로리:</span> {profile.target_cal || '-'} kcal | <span className="text-gray-400">탄:</span> {profile.target_carbs || '-'}g | <span className="text-gray-400">단:</span> {profile.target_protein || '-'}g | <span className="text-gray-400">지:</span> {profile.target_fat || '-'}g</p>
                </div>
              )}
              
              {/* 🌟 저장된 식단 모달 열기 버튼 (사이드바 유지) */}
              <button 
                onClick={() => setShowFavModal(true)}
                className="w-full mt-3 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-lg text-xs font-bold hover:bg-gray-50 shadow-sm transition"
              >
                📂 내 저장된 식단 통합 관리
              </button>

            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-700">🔎 어플 크기 조절</h3>
                <span className="text-xs font-bold text-blue-500">{appScale}%</span>
              </div>
              <div className="flex justify-between gap-1 mt-2">
                {[80, 90, 100, 110, 120].map((size) => (
                  <button
                    key={size}
                    onClick={() => setAppScale(size)}
                    className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                      appScale === size ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center">원하는 비율을 클릭하세요 (잘림 방지 적용)</p>
            </div>
          </div>
        </div>

        {/* 상단 헤더 (컴팩트) */}
        <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm mb-3 border border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="p-1 hover:bg-gray-100 rounded-md transition">
              <Menu className="text-gray-700 w-5 h-5" />
            </button>
            <h1 className="text-lg font-extrabold text-gray-800 tracking-tight">🥗 건강 관리</h1>
          </div>
          <div className="text-xs font-bold text-gray-400">
            {todayString}
          </div>
        </div>

        {/* 🌟 목표 달성 진행률 (탄/단/지 개별 게이지 및 모바일 반응형 완벽 적용) */}
        {activeTab === 'today' && profile.target_cal > 0 && (() => {
          // 1. 오늘의 데이터만 추출하여 각 영양소별 합계 계산
          const todayDiets = diets.filter(d => (d.diet_date || d.created_at.split('T')[0]) === todayString);
          const tCal = todayDiets.reduce((sum, d) => sum + d.calories, 0);
          const tCarbs = todayDiets.reduce((sum, d) => sum + d.carbs, 0);
          const tPro = todayDiets.reduce((sum, d) => sum + d.protein, 0);
          const tFat = todayDiets.reduce((sum, d) => sum + d.fat, 0);

          // 2. 퍼센트 계산 (목표치가 0일 경우 에러 방지, 최대 100% 제한)
          const calPercent = profile.target_cal ? Math.min(100, Math.round((tCal / profile.target_cal) * 100)) : 0;
          const carbPercent = profile.target_carbs ? Math.min(100, Math.round((tCarbs / profile.target_carbs) * 100)) : 0;
          const proPercent = profile.target_protein ? Math.min(100, Math.round((tPro / profile.target_protein) * 100)) : 0;
          const fatPercent = profile.target_fat ? Math.min(100, Math.round((tFat / profile.target_fat) * 100)) : 0;

          return (
            <div className="bg-white p-5 rounded-2xl shadow-sm mb-6 border border-indigo-100 w-full overflow-hidden block">
              <h2 className="font-bold text-gray-700 text-sm mb-4">🔥 오늘의 영양소 달성률</h2>
              
              {/* 모바일에서는 1줄(세로), PC에서는 3칸으로 쪼개지는 반응형 그리드 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                
                {/* 1. 칼로리 메인 게이지 (모든 화면에서 가장 위, 전체 너비 차지) */}
                <div className="sm:col-span-3 mb-2">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-gray-600">⚡ 총 칼로리</span>
                    <span className="text-indigo-600 font-bold">{tCal} / {profile.target_cal} kcal ({calPercent}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                    <div className={`h-3 rounded-full transition-all duration-1000 ${tCal > profile.target_cal ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-400 to-indigo-600'}`} style={{ width: `${calPercent}%` }}></div>
                  </div>
                </div>

                {/* 2. 탄수화물 게이지 */}
                <div className="w-full">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-gray-600">🍚 탄수화물</span>
                    <span className="text-blue-500 font-bold">{tCarbs} / {profile.target_carbs}g</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                    <div className={`h-2 rounded-full transition-all duration-1000 ${tCarbs > profile.target_carbs ? 'bg-red-400' : 'bg-blue-400'}`} style={{ width: `${carbPercent}%` }}></div>
                  </div>
                </div>

                {/* 3. 단백질 게이지 */}
                <div className="w-full">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-gray-600">🍗 단백질</span>
                    <span className="text-green-600 font-bold">{tPro} / {profile.target_protein}g</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                    <div className={`h-2 rounded-full transition-all duration-1000 ${tPro > profile.target_protein ? 'bg-red-400' : 'bg-green-500'}`} style={{ width: `${proPercent}%` }}></div>
                  </div>
                </div>

                {/* 4. 지방 게이지 */}
                <div className="w-full">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-gray-600">🥑 지방</span>
                    <span className="text-yellow-600 font-bold">{tFat} / {profile.target_fat}g</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                    <div className={`h-2 rounded-full transition-all duration-1000 ${tFat > profile.target_fat ? 'bg-red-400' : 'bg-yellow-400'}`} style={{ width: `${fatPercent}%` }}></div>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

        {/* 상단 탭 메뉴 (컴팩트) */}
        <div className="flex bg-white rounded-lg shadow-sm p-1 mb-4 border border-gray-100">
          <button 
            className={`flex-1 py-1.5 rounded-md font-bold text-[11px] sm:text-xs transition-all ${activeTab === 'today' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('today')}
          >
            오늘의 식단기록
          </button>
          <button 
            className={`flex-1 py-1.5 rounded-md font-bold text-[11px] sm:text-xs transition-all ${activeTab === 'recommend' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('recommend')}
          >
            ✨ 메뉴 추천
          </button>
          <button 
            className={`flex-1 py-1.5 rounded-md font-bold text-[11px] sm:text-xs transition-all ${activeTab === 'history' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('history')}
          >
            나의 먹생활
          </button>
        </div>

        {/* 탭: 나의 먹생활 (history) */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-6">
            
            {/* 달력 섹션 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition"><ChevronLeft /></button>
                <h2 className="text-lg font-bold text-gray-800">{year}년 {month + 1}월</h2>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition"><ChevronRight /></button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                  <div key={day} className="font-semibold text-gray-400 py-1">{day}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center">
                {emptyDays.map((_, i) => <div key={`empty-${i}`} className="p-2"></div>)}
                {monthDays.map(day => {
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = dateStr === selectedDate;
                  const isToday = dateStr === todayString;
                  // 이 날짜에 기록이 있는지 확인 (파란색 점 표시)
                  const hasRecord = diets.some(d => (d.diet_date || d.created_at.split('T')[0]) === dateStr);
                  
                  return (
                    <button 
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${isSelected ? 'bg-blue-500 text-white font-bold shadow-md' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      <span className={isToday && !isSelected ? 'text-blue-500 font-bold' : ''}>{day}</span>
                      {hasRecord && <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-blue-400'}`}></span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 건강 정보 요약 섹션 */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl shadow-sm border border-blue-200">
              <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" /> {selectedDate} 건강 요약
              </h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white p-3 rounded-xl shadow-sm"><p className="text-xs text-gray-500">칼로리</p><p className="font-bold text-blue-600">{totalCal}</p></div>
                <div className="bg-white p-3 rounded-xl shadow-sm"><p className="text-xs text-gray-500">탄수화물</p><p className="font-bold text-gray-800">{totalCarbs}g</p></div>
                <div className="bg-white p-3 rounded-xl shadow-sm"><p className="text-xs text-gray-500">단백질</p><p className="font-bold text-gray-800">{totalProtein}g</p></div>
                <div className="bg-white p-3 rounded-xl shadow-sm"><p className="text-xs text-gray-500">지방</p><p className="font-bold text-gray-800">{totalFat}g</p></div>
              </div>
            </div>

            {/* 해당 날짜 식단 리스트 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-4">상세 기록</h3>
              {selectedDiets.length === 0 ? (
                <p className="text-center text-gray-400 py-8 border-2 border-dashed border-gray-100 rounded-xl">이 날은 기록된 식단이 없습니다.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {selectedDiets.map(diet => (
                    <div key={diet.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center hover:bg-gray-100 transition">
                      <p className="font-bold text-gray-800">{diet.food_name}</p>
                      <div className="text-right">
                         <p className="text-sm font-bold text-blue-500">{diet.calories} kcal</p>
                         <p className="text-xs text-gray-500 mt-0.5">탄 {diet.carbs} | 단 {diet.protein} | 지 {diet.fat}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

{/* 탭: 메뉴 추천 (recommend) */}
        {activeTab === 'recommend' && (() => {
          if (!profile.target_cal) {
            return (
              <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
                <p className="text-gray-500 text-lg">메뉴를 추천받으려면 목표가 필요해요!</p>
                <p className="text-gray-400 text-sm mt-2">좌측 상단 햄버거 메뉴를 열어 프로필에서 목표를 설정해주세요.</p>
              </div>
            );
          }

          // 부족한 양 계산하기
          const todayDiets = diets.filter(d => (d.diet_date || d.created_at.split('T')[0]) === todayString);
          const tCarbs = todayDiets.reduce((sum, d) => sum + d.carbs, 0);
          const tPro = todayDiets.reduce((sum, d) => sum + d.protein, 0);
          const tFat = todayDiets.reduce((sum, d) => sum + d.fat, 0);

          const carbDef = profile.target_carbs - tCarbs;
          const proDef = profile.target_protein - tPro;
          const fatDef = profile.target_fat - tFat;

          // 목표를 초과 달성했는지 체크
          if (carbDef <= 0 && proDef <= 0 && fatDef <= 0) {
            return (
              <div className="bg-indigo-50 p-10 rounded-2xl shadow-sm border border-indigo-100 text-center">
                <h3 className="text-indigo-800 font-bold text-xl mb-2">🎉 완벽한 하루!</h3>
                <p className="text-indigo-600">오늘 목표 영양소를 모두 채우셨습니다. 대단해요!</p>
              </div>
            );
          }

          // 가장 부족한 영양소 찾기
          let mostDeficient = 'protein'; // 기본값
          let maxDef = proDef;

          if (carbDef > maxDef) { mostDeficient = 'carbs'; maxDef = carbDef; }
          if (fatDef > maxDef) { mostDeficient = 'fat'; maxDef = fatDef; }

          const nutrientName = mostDeficient === 'carbs' ? '탄수화물' : mostDeficient === 'protein' ? '단백질' : '지방';
          const suggestions = RECOMMENDED_MENUS[mostDeficient];

          return (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-base font-extrabold text-gray-800 mb-3 tracking-tight">💡 AI 맞춤 식단 제안</h2>
              
              <div className="bg-indigo-50 p-3 rounded-lg mb-4 border border-indigo-100 flex items-center justify-between">
                <div>
                  <p className="text-indigo-900 font-bold text-xs mb-0.5">
                    현재 <span className="text-red-500 font-extrabold">{nutrientName}</span> 섭취가 가장 부족해요!
                  </p>
                  <p className="text-[10px] text-indigo-700">목표치까지 약 <span className="font-bold">{maxDef}g</span>이 더 필요합니다. 엄선된 9가지 메뉴를 확인해보세요.</p>
                </div>
                <div className="text-3xl opacity-80">{mostDeficient === 'carbs' ? '🍚' : mostDeficient === 'protein' ? '🥩' : '🥑'}</div>
              </div>
              
              {/* 컴팩트 3열 그리드 (이름과 설명만 표시) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {suggestions.map((menu, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedRecipe({...menu, type: mostDeficient})}
                    className="border border-gray-100 p-3 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between h-full"
                  >
                    <div>
                      <h3 className="font-bold text-gray-800 text-xs mb-1 group-hover:text-indigo-600 transition-colors">{menu.name}</h3>
                      <p className="text-[10px] text-gray-500 line-clamp-2 leading-snug">{menu.desc}</p>
                    </div>
                    <div className="text-[9px] font-bold text-indigo-400 mt-2 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      레시피 보기 ➔
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
        {/* 탭: 오늘의 식단기록 (today) */}
        <div className={activeTab === 'today' ? 'block' : 'hidden'}>

        {/* 🌟 자주 먹는 식단 목록 표시 영역 */}
        {favorites.length > 0 && (
          <div className="mb-4 bg-yellow-50 p-4 rounded-xl border border-yellow-200 shadow-sm transition-all">
            <h3 className="text-xs font-bold text-yellow-800 mb-3 flex items-center gap-1">⭐ 자주 먹는 식단 (클릭하면 바로 입력됩니다)</h3>
            <div className="flex flex-wrap gap-2">
              {favorites.map(fav => (
                <div 
                  key={fav.id}
                  onClick={() => setNewDiet({ food_name: fav.food_name, calories: fav.calories, carbs: fav.carbs, protein: fav.protein, fat: fav.fat })}
                  className="bg-white border border-yellow-300 px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 shadow-sm cursor-pointer hover:bg-yellow-100 flex items-center gap-2 transition"
                >
                  <span>{fav.food_name} <span className="text-yellow-600 font-extrabold ml-1">{fav.calories}kcal</span></span>
                  <button onClick={(e) => removeFavorite(fav.id, e)} className="text-gray-300 hover:text-red-500 font-bold ml-1 px-1">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 식단 입력 창 (컴팩트 3행 구조) */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-5 border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-gray-800 tracking-tight">새 식단 기록하기</h2>
            <button 
              type="button" 
              onClick={addFavorite}
              className="text-[10px] bg-yellow-50 text-yellow-600 px-2 py-1 rounded-md font-bold hover:bg-yellow-100 transition border border-yellow-200"
            >
              ⭐ 내용 저장
            </button>
          </div>
          <form onSubmit={addDiet} className="grid grid-cols-2 gap-2.5">
            
            {/* 1행: 음식 이름 */}
            <div className="col-span-2 relative">
              <label className="text-[10px] font-bold text-gray-500 uppercase">음식 이름</label>
              <input 
                className="w-full border border-gray-200 p-1.5 mt-0.5 rounded-md text-sm bg-gray-50 focus:bg-white outline-none focus:border-gray-400 transition-colors"
                placeholder="예: 햇반, 사과 (자동완성)" 
                value={newDiet.food_name} 
                onChange={(e) => { setNewDiet({...newDiet, food_name: e.target.value}); setShowSuggestions(true); }} 
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              
              {/* 🌟 자동완성 드롭다운 (저장된 식단 최우선 노출 로직 적용) */}
              {showSuggestions && newDiet.food_name && (() => {
                // 1. 내 즐겨찾기에서 검색 (우선순위 1)
                const favMatches = favorites.filter(f => f.food_name.includes(newDiet.food_name)).map(f => ({ ...f, name: f.food_name, cal: f.calories, isFav: true }));
                // 2. 기본 데이터에서 검색 (즐겨찾기에 이미 있는 이름은 중복 제거)
                const commonMatches = COMMON_FOODS.filter(f => f.name.includes(newDiet.food_name) && !favMatches.some(fav => fav.name === f.name)).map(f => ({ ...f, isFav: false }));
                const combinedMatches = [...favMatches, ...commonMatches];

                if (combinedMatches.length === 0) return null;

                return (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {combinedMatches.map((food, idx) => (
                      <div 
                        key={idx} 
                        className="p-2.5 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition"
                        onClick={() => {
                          setNewDiet({ food_name: food.name, calories: food.cal, carbs: food.carbs, protein: food.protein, fat: food.fat });
                          setShowSuggestions(false);
                        }}
                      >
                        <span className="font-bold text-xs text-gray-700 flex items-center gap-1">
                          {food.isFav && <span className="text-yellow-500 text-[10px]">⭐</span>}
                          {food.name}
                        </span> 
                        <span className="text-gray-500 text-[10px] font-bold">{food.cal} kcal</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* 2행: 칼로리, 탄수화물 */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">칼로리 (kcal)</label>
              <input type="number" className="w-full border border-gray-200 p-1.5 mt-0.5 rounded-md text-sm bg-gray-50 focus:bg-white outline-none focus:border-gray-400" placeholder="0" value={newDiet.calories} onChange={(e) => setNewDiet({...newDiet, calories: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">탄수화물 (g)</label>
              <input type="number" className="w-full border border-gray-200 p-1.5 mt-0.5 rounded-md text-sm bg-gray-50 focus:bg-white outline-none focus:border-gray-400" placeholder="0" value={newDiet.carbs} onChange={(e) => setNewDiet({...newDiet, carbs: e.target.value})} />
            </div>

            {/* 3행: 단백질, 지방 */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">단백질 (g)</label>
              <input type="number" className="w-full border border-gray-200 p-1.5 mt-0.5 rounded-md text-sm bg-gray-50 focus:bg-white outline-none focus:border-gray-400" placeholder="0" value={newDiet.protein} onChange={(e) => setNewDiet({...newDiet, protein: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">지방 (g)</label>
              <input type="number" className="w-full border border-gray-200 p-1.5 mt-0.5 rounded-md text-sm bg-gray-50 focus:bg-white outline-none focus:border-gray-400" placeholder="0" value={newDiet.fat} onChange={(e) => setNewDiet({...newDiet, fat: e.target.value})} />
            </div>
            
            {/* 컴팩트 버튼 묶음 */}
            <div className="col-span-2 mt-2 flex gap-2">
              <button 
                type="button" 
                onClick={resetForm}
                className="w-1/3 bg-white text-gray-600 font-bold p-2 rounded-md text-xs hover:bg-gray-50 border border-gray-200 shadow-sm transition"
              >
                초기화
              </button>
              <button 
                type="submit" 
                className={`w-2/3 text-white font-bold p-2 rounded-md text-xs shadow-sm transition ${
                  editingId ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-gray-800 hover:bg-gray-900'
                }`}
              >
                {editingId ? '✨ 수정 내용 저장' : '기록 저장하기'}
              </button>
            </div>
          </form>
        </div>

        {/* 내 식단 목록 리스트 (오늘 날짜만 필터링) */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">오늘의 식단 기록 📝</h2>
          <div className="flex flex-col gap-3">
            {diets.filter(diet => (diet.diet_date || diet.created_at.split('T')[0]) === todayString).length === 0 ? (
              <p className="text-gray-400 text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">오늘 기록된 식단이 없습니다. 첫 식단을 입력해 보세요!</p>
            ) : (
              diets.filter(diet => (diet.diet_date || diet.created_at.split('T')[0]) === todayString).map((diet) => (
                <div 
                  key={diet.id} 
                  className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-gray-300 transition-colors"
                >
                  <div className="pl-1">
                    <p className="font-bold text-sm text-gray-800">{diet.food_name}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">
                      {new Date(diet.created_at).toLocaleTimeString('ko-KR', {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-md justify-between sm:justify-end">
                    <div className="flex gap-3 text-center">
                      <div className="flex flex-col"><span className="text-gray-400 text-[9px] font-bold">KCAL</span><span className="font-bold text-gray-800 text-xs">{diet.calories}</span></div>
                      <div className="flex flex-col"><span className="text-gray-400 text-[9px] font-bold">탄수</span><span className="font-semibold text-gray-600 text-xs">{diet.carbs}</span></div>
                      <div className="flex flex-col"><span className="text-gray-400 text-[9px] font-bold">단백</span><span className="font-semibold text-gray-600 text-xs">{diet.protein}</span></div>
                      <div className="flex flex-col"><span className="text-gray-400 text-[9px] font-bold">지방</span><span className="font-semibold text-gray-600 text-xs">{diet.fat}</span></div>
                    </div>
                    
                    {/* 컴팩트 수정/삭제 버튼 */}
                    <div className="flex flex-row sm:flex-col gap-1 ml-1 pl-2 border-l border-gray-200">
                      <button onClick={() => editDiet(diet)} className="text-gray-400 hover:text-gray-800 transition-colors p-1" title="수정">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteDiet(diet.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="삭제">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
                  
                  </div> {/* 오늘의 식단기록(today) 탭 상자 닫기 */}

                  {/* 🌟 2단계: 저장된 식단 관리 모달창 (독립성 보장 및 외부 클릭 닫기) */}
                  {showFavModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 z-[70] flex items-center justify-center p-4" onClick={() => setShowFavModal(false)}>
                      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col relative animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                        
                        {/* 모달 헤더 */}
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                          <h2 className="text-base font-extrabold text-gray-800">📂 내 저장된 식단 관리</h2>
                          <button onClick={() => setShowFavModal(false)} className="p-1 hover:bg-gray-200 rounded-md transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>
                        
                        {/* 모달 컨텐츠 영역 */}
                        <div className="p-4 overflow-y-auto bg-white flex-1">
                          {favorites.length === 0 ? (
                            <p className="text-center text-gray-400 py-10 text-sm">저장된 식단이 없습니다. 메인 화면에서 식단을 기록하며 자주 먹는 음식을 추가해 보세요!</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {favorites.map(fav => (
                                <div key={fav.id} className="border border-gray-200 p-3 rounded-lg bg-gray-50 relative group transition-colors hover:border-gray-300">
                                  {editingFavId === fav.id ? (
                                    /* 수정 모드 UI */
                                    <div className="flex flex-col gap-2 text-xs">
                                      <input className="border border-gray-200 p-1.5 rounded bg-white outline-none focus:border-indigo-400" value={editFavData.food_name} onChange={e => setEditFavData({...editFavData, food_name: e.target.value})} placeholder="음식명" />
                                      <div className="grid grid-cols-2 gap-1.5">
                                        <div className="flex items-center gap-1"><span className="text-[9px] text-gray-400 w-6">kcal</span><input type="number" className="border border-gray-200 p-1 rounded w-full bg-white" value={editFavData.calories} onChange={e => setEditFavData({...editFavData, calories: e.target.value})} /></div>
                                        <div className="flex items-center gap-1"><span className="text-[9px] text-gray-400 w-6">탄수</span><input type="number" className="border border-gray-200 p-1 rounded w-full bg-white" value={editFavData.carbs} onChange={e => setEditFavData({...editFavData, carbs: e.target.value})} /></div>
                                        <div className="flex items-center gap-1"><span className="text-[9px] text-gray-400 w-6">단백</span><input type="number" className="border border-gray-200 p-1 rounded w-full bg-white" value={editFavData.protein} onChange={e => setEditFavData({...editFavData, protein: e.target.value})} /></div>
                                        <div className="flex items-center gap-1"><span className="text-[9px] text-gray-400 w-6">지방</span><input type="number" className="border border-gray-200 p-1 rounded w-full bg-white" value={editFavData.fat} onChange={e => setEditFavData({...editFavData, fat: e.target.value})} /></div>
                                      </div>
                                      <div className="flex gap-1.5 mt-1">
                                        <button onClick={() => updateFavorite(fav.id)} className="flex-1 bg-gray-800 text-white rounded py-1.5 font-bold hover:bg-gray-900 transition-colors">저장</button>
                                        <button onClick={() => setEditingFavId(null)} className="flex-1 bg-white border border-gray-200 text-gray-600 rounded py-1.5 font-bold hover:bg-gray-100 transition-colors">취소</button>
                                      </div>
                                    </div>
                                  ) : (
                                    /* 읽기 모드 UI */
                                    <>
                                      <div className="flex justify-between items-start mb-2.5">
                                        <h3 className="font-bold text-gray-800 text-sm">{fav.food_name}</h3>
                                        <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50 rounded pl-1">
                                          <button onClick={() => { setEditingFavId(fav.id); setEditFavData(fav); }} className="text-gray-400 hover:text-green-600 p-1 bg-white rounded shadow-sm border border-gray-100"><Edit2 className="w-3 h-3" /></button>
                                          <button onClick={(e) => removeFavorite(fav.id, e)} className="text-gray-400 hover:text-red-500 p-1 bg-white rounded shadow-sm border border-gray-100"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                                        <div className="bg-white p-1 rounded-md border border-gray-100 shadow-sm"><span className="block text-gray-400 font-bold mb-0.5 uppercase text-[8px]">kcal</span><span className="font-extrabold text-indigo-600">{fav.calories}</span></div>
                                        <div className="bg-white p-1 rounded-md border border-gray-100 shadow-sm"><span className="block text-gray-400 font-bold mb-0.5 uppercase text-[8px]">탄수</span><span className="font-semibold text-gray-700">{fav.carbs}</span></div>
                                        <div className="bg-white p-1 rounded-md border border-gray-100 shadow-sm"><span className="block text-gray-400 font-bold mb-0.5 uppercase text-[8px]">단백</span><span className="font-semibold text-gray-700">{fav.protein}</span></div>
                                        <div className="bg-white p-1 rounded-md border border-gray-100 shadow-sm"><span className="block text-gray-400 font-bold mb-0.5 uppercase text-[8px]">지방</span><span className="font-semibold text-gray-700">{fav.fat}</span></div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* 🌟 3단계: 추천 메뉴 상세 레시피 모달창 (완전 독립 및 외부 클릭 닫기) */}
                  {selectedRecipe && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-[80] flex items-center justify-center p-4" onClick={() => setSelectedRecipe(null)}>
                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col relative animate-fade-in-up border border-gray-100" onClick={(e) => e.stopPropagation()}>
                        
                        {/* 헤더 배너 (영양소별 컬러 포인트) */}
                        <div className={`p-5 flex justify-between items-start ${selectedRecipe.type === 'carbs' ? 'bg-blue-50' : selectedRecipe.type === 'protein' ? 'bg-green-50' : 'bg-yellow-50'}`}>
                          <div>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-2 inline-block ${selectedRecipe.type === 'carbs' ? 'bg-blue-200 text-blue-800' : selectedRecipe.type === 'protein' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                              {selectedRecipe.type === 'carbs' ? '탄수화물 추천' : selectedRecipe.type === 'protein' ? '단백질 추천' : '지방 추천'}
                            </span>
                            <h2 className="text-lg font-extrabold text-gray-900 leading-tight">{selectedRecipe.name}</h2>
                          </div>
                          <button onClick={() => setSelectedRecipe(null)} className="p-1 bg-white/50 hover:bg-white rounded-full transition-colors shadow-sm">
                            <X className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                        
                        <div className="p-5">
                          <p className="text-xs text-gray-600 mb-4 bg-gray-50 p-2.5 rounded-lg border border-gray-100 leading-relaxed font-medium">
                            "{selectedRecipe.desc}"
                          </p>
                          
                          <div className="mb-4">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <span className="text-indigo-500 text-base">🍳</span> 1분 레시피
                            </h3>
                            <p className="text-sm text-gray-800 leading-relaxed border-l-2 border-indigo-400 pl-3 py-1">
                              {selectedRecipe.recipe}
                            </p>
                          </div>

                          {/* 영양 성분 컴팩트 박스 */}
                          <div className="grid grid-cols-4 gap-2 text-center mt-5 pt-4 border-t border-gray-100">
                            <div className="flex flex-col"><span className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">칼로리</span><span className="font-extrabold text-indigo-600 text-sm">{selectedRecipe.cal}<span className="text-[9px] font-normal text-gray-500 ml-0.5">kcal</span></span></div>
                            <div className="flex flex-col"><span className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">탄수화물</span><span className="font-bold text-gray-700 text-sm">{selectedRecipe.carbs}<span className="text-[9px] font-normal text-gray-500 ml-0.5">g</span></span></div>
                            <div className="flex flex-col"><span className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">단백질</span><span className="font-bold text-gray-700 text-sm">{selectedRecipe.protein}<span className="text-[9px] font-normal text-gray-500 ml-0.5">g</span></span></div>
                            <div className="flex flex-col"><span className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">지방</span><span className="font-bold text-gray-700 text-sm">{selectedRecipe.fat}<span className="text-[9px] font-normal text-gray-500 ml-0.5">g</span></span></div>
                          </div>
                        </div>

                        <div className="p-3 bg-gray-50 border-t border-gray-100">
                           <button onClick={() => setSelectedRecipe(null)} className="w-full py-2 bg-gray-800 text-white rounded-lg text-xs font-bold hover:bg-gray-900 transition-colors">
                             닫기
                           </button>
                        </div>
                      </div>
                    </div>
                  )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          }

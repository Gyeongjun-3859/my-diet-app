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
        fetchProfile(session.user.id); // 프로필 정보도 같이 가져옵니다!
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchDiets();
        fetchProfile(session.user.id);
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
  // 4. 데이터베이스(Supabase)와 소통하기 (식단 & 프로필)
  // ---------------------------------------------------------
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
          <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">나만의 식단 관리 🥗</h1>
          <form className="flex flex-col gap-4">
            <input 
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="email" 
              placeholder="이메일을 입력하세요" 
              value={email} onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="password" 
              placeholder="비밀번호를 입력하세요 (6자리 이상)" 
              value={password} onChange={(e) => setPassword(e.target.value)} 
            />
            <button 
              className="bg-blue-500 text-white p-3 rounded-lg font-bold hover:bg-blue-600 transition"
              onClick={handleLogin} disabled={loading}
            >
              로그인
            </button>
            <button 
              className="bg-gray-100 text-gray-700 p-3 rounded-lg font-bold hover:bg-gray-200 transition"
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 overflow-x-hidden">
      {/* 어플 크기 조절: 이제 html 뿌리 폰트 크기로 자동 조절되므로 transform을 제거했습니다 */}
      <div className="max-w-3xl mx-auto">
        
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

        {/* 상단 헤더 */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
              <Menu className="text-gray-700 w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">🥗 건강 관리</h1>
          </div>
          <div className="text-sm font-bold text-gray-400">
            {todayString}
          </div>
        </div>

        {/* 🌟 목표 달성 진행률 (Progress Bar) */}
        {activeTab === 'today' && profile.target_cal > 0 && (
          <div className="bg-white p-5 rounded-xl shadow-sm mb-6 border border-indigo-100">
            <div className="flex justify-between items-end mb-2">
              <h2 className="font-bold text-gray-700 text-sm">🔥 오늘의 목표 달성률</h2>
              <span className="text-xs font-bold text-indigo-600">
                {Math.min(100, Math.round((diets.filter(d => (d.diet_date || d.created_at.split('T')[0]) === todayString).reduce((sum, d) => sum + d.calories, 0) / profile.target_cal) * 100))}%
              </span>
            </div>
            {/* 게이지 바 배경 */}
            <div className="w-full bg-gray-100 rounded-full h-3.5 mb-3 overflow-hidden shadow-inner">
              {/* 게이지 바 색상 채우기 */}
              <div 
                className={`h-3.5 rounded-full transition-all duration-1000 ease-out ${
                  (diets.filter(d => (d.diet_date || d.created_at.split('T')[0]) === todayString).reduce((sum, d) => sum + d.calories, 0) > profile.target_cal) 
                  ? 'bg-red-500' // 초과하면 빨간색
                  : 'bg-gradient-to-r from-indigo-400 to-indigo-600' // 정상일 땐 예쁜 그라데이션
                }`}
                style={{ width: `${Math.min(100, (diets.filter(d => (d.diet_date || d.created_at.split('T')[0]) === todayString).reduce((sum, d) => sum + d.calories, 0) / profile.target_cal) * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 text-right">
              <span className="font-bold text-gray-800">{diets.filter(d => (d.diet_date || d.created_at.split('T')[0]) === todayString).reduce((sum, d) => sum + d.calories, 0)}</span> / {profile.target_cal} kcal
            </p>
          </div>
        )}

        {/* 상단 탭 메뉴 */}
        <div className="flex bg-white rounded-xl shadow-sm p-1.5 mb-6 border border-gray-100">
          <button 
            className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'today' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('today')}
          >
            오늘의 식단기록
          </button>
          <button 
            className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'history' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
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

        {/* 탭: 오늘의 식단기록 (today) */}
        <div className={activeTab === 'today' ? 'block' : 'hidden'}>

        {/* 식단 입력 창 (3행 구조 및 자동완성 적용) */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">새 식단 기록하기</h2>
          <form onSubmit={addDiet} className="grid grid-cols-2 gap-4">
            
            {/* 1행: 음식 이름 (전체 너비 차지, 자동완성 기능 포함) */}
            <div className="col-span-2 relative">
              <label className="text-xs font-bold text-gray-500">음식 이름</label>
              <input 
                className="w-full border p-2 mt-1 rounded-lg bg-gray-50 focus:bg-white"
                placeholder="음식 이름을 입력하면 자동완성이 뜹니다 (예: 햇반, 사과)" 
                value={newDiet.food_name} 
                onChange={(e) => {
                  setNewDiet({...newDiet, food_name: e.target.value});
                  setShowSuggestions(true); // 글자를 치면 목록 열기
                }} 
                onFocus={() => setShowSuggestions(true)}
                // 마우스가 밖으로 나가면 0.2초 뒤에 목록 닫기 (클릭할 시간 벌기)
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              
              {/* 자동완성 드롭다운 상자 */}
              {showSuggestions && newDiet.food_name && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {COMMON_FOODS.filter(f => f.name.includes(newDiet.food_name)).map((food, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition"
                      onClick={() => {
                        // 클릭 시 모든 영양소 정보를 한 번에 싹 채워줍니다!
                        setNewDiet({
                          food_name: food.name, calories: food.cal, carbs: food.carbs, protein: food.protein, fat: food.fat
                        });
                        setShowSuggestions(false);
                      }}
                    >
                      <span className="font-bold text-gray-700">{food.name}</span> 
                      <span className="text-blue-500 text-xs font-bold">{food.cal} kcal</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2행: 칼로리, 탄수화물 */}
            <div>
              <label className="text-xs font-bold text-gray-500">칼로리 (kcal)</label>
              <input type="number" className="w-full border p-2 mt-1 rounded-lg bg-gray-50 focus:bg-white transition-colors" placeholder="0" value={newDiet.calories} onChange={(e) => setNewDiet({...newDiet, calories: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">탄수화물 (g)</label>
              <input type="number" className="w-full border p-2 mt-1 rounded-lg bg-gray-50 focus:bg-white transition-colors" placeholder="0" value={newDiet.carbs} onChange={(e) => setNewDiet({...newDiet, carbs: e.target.value})} />
            </div>

            {/* 3행: 단백질, 지방 */}
            <div>
              <label className="text-xs font-bold text-gray-500">단백질 (g)</label>
              <input type="number" className="w-full border p-2 mt-1 rounded-lg bg-gray-50 focus:bg-white transition-colors" placeholder="0" value={newDiet.protein} onChange={(e) => setNewDiet({...newDiet, protein: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">지방 (g)</label>
              <input type="number" className="w-full border p-2 mt-1 rounded-lg bg-gray-50 focus:bg-white transition-colors" placeholder="0" value={newDiet.fat} onChange={(e) => setNewDiet({...newDiet, fat: e.target.value})} />
            </div>
            
            <div className="col-span-2 mt-2 flex gap-3">
              <button 
                type="button" 
                onClick={resetForm}
                className="w-1/3 bg-gray-100 text-gray-600 font-bold p-3 rounded-lg hover:bg-gray-200 border border-gray-200 transition"
              >
                초기화
              </button>
              <button 
                type="submit" 
                className={`w-2/3 text-white font-bold p-3 rounded-lg shadow-md transition ${editingId ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                {editingId ? '✨ 수정 내용 저장하기' : '기록 저장하기'}
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
                <div key={diet.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition">
                  <div>
                    <p className="font-bold text-lg text-gray-800">{diet.food_name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(diet.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                 <div className="flex items-center gap-4 text-sm text-center">
                    <div className="flex flex-col"><span className="text-gray-400 text-xs">칼로리</span><span className="font-semibold">{diet.calories}</span></div>
                    <div className="flex flex-col"><span className="text-gray-400 text-xs">탄</span><span className="font-semibold">{diet.carbs}</span></div>
                    <div className="flex flex-col"><span className="text-gray-400 text-xs">단</span><span className="font-semibold">{diet.protein}</span></div>
                    <div className="flex flex-col"><span className="text-gray-400 text-xs">지</span><span className="font-semibold">{diet.fat}</span></div>
                    
                    {/* 수정 & 삭제 버튼 묶음 */}
                    <div className="flex flex-col gap-2 ml-2 border-l pl-3 border-gray-100">
                      <button onClick={() => editDiet(diet)} className="text-gray-400 hover:text-green-500 transition" title="수정">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteDiet(diet.id)} className="text-gray-400 hover:text-red-500 transition" title="삭제">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        </div> {/* 오늘의 식단기록(today) 탭 상자 닫기 */}

      </div>
    </div>
  );
}

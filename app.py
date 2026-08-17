import streamlit as st
import google.generativeai as genai
import json
import plotly.graph_objects as go
import time

# إعدادات الصفحة الأساسية
st.set_page_config(page_title="منصة التقييم المعرفي الذكية", page_icon="🧠", layout="centered")

# تحسين واجهة المستخدم ودعم اللغة العربية (RTL)
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap');
    html, body, [class*="css"]  {
        font-family: 'Tajawal', sans-serif;
        direction: rtl;
        text-align: right;
    }
    .stButton>button {
        background-color: #2e6c80;
        color: white;
        border-radius: 8px;
        padding: 10px 24px;
        font-weight: bold;
        width: 100%;
        transition: all 0.3s ease;
    }
    .stButton>button:hover {
        background-color: #1e4b59;
        border-color: #1e4b59;
    }
    .question-card {
        background-color: #ffffff;
        padding: 25px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        margin-bottom: 20px;
        border-right: 5px solid #2e6c80;
    }
    /* Hide Streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
</style>
""", unsafe_allow_html=True)

# تهيئة متغيرات الجلسة (Session State)
if 'step' not in st.session_state:
    st.session_state.step = 'setup' # setup, testing, results
if 'questions_answered' not in st.session_state:
    st.session_state.questions_answered = 0
if 'total_questions' not in st.session_state:
    st.session_state.total_questions = 10
if 'user_age' not in st.session_state:
    st.session_state.user_age = 25
if 'score' not in st.session_state:
    st.session_state.score = 0
if 'current_q' not in st.session_state:
    st.session_state.current_q = None
if 'category_scores' not in st.session_state:
    st.session_state.category_scores = {
        "الاستدلال المنطقي": {"correct": 0, "total": 0},
        "الاستدلال الرياضي": {"correct": 0, "total": 0},
        "الفهم اللفظي": {"correct": 0, "total": 0},
        "القدرة المكانية": {"correct": 0, "total": 0}
    }

# الشريط الجانبي لإعدادات المفتاح
with st.sidebar:
    st.header("⚙️ إعدادات النظام")
    st.write("لضمان عمل النظام، يرجى إدخال مفتاح Gemini API الخاص بك.")
    api_key_input = st.text_input("Gemini API Key:", type="password", help="احصل عليه مجاناً من Google AI Studio")
    st.markdown("---")
    st.info("💡 هذا التطبيق يعمل بالكامل دون الحاجة لقواعد بيانات أو خوادم مدفوعة. يحافظ على خصوصيتك ولا يخزن بياناتك.")

# دالة جلب الأسئلة
def generate_question(age, current_difficulty):
    if not api_key_input:
        return None
    
    genai.configure(api_key=api_key_input)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # اختيار فئة عشوائية للسؤال لضمان التنوع
    categories = ["الاستدلال المنطقي", "الاستدلال الرياضي", "الفهم اللفظي", "القدرة المكانية"]
    selected_category = categories[st.session_state.questions_answered % 4]

    prompt = f"""
    أنت خبير قياس نفسي عالمي. 
    قم بتوليد سؤال اختبار ذكاء (IQ Test) دقيق واحترافي باللغة العربية لمستخدم عمره {age} سنة.
    الفئة المطلوبة للسؤال: {selected_category}
    مستوى الصعوبة المطلوب: {current_difficulty} (من 1 إلى 5)
    
    شروط هامة:
    1. يجب أن يكون السؤال واضحاً ولا يحتمل أكثر من إجابة صحيحة.
    2. يجب أن تكون الخيارات 4 خيارات فقط.
    3. أرجع النتيجة بصيغة JSON فقط، بدون أي نصوص إضافية، بدون markdown، بهذا الهيكل المكتوب بالضبط:
    {{
        "category": "{selected_category}",
        "question": "نص السؤال هنا",
        "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
        "answer": "الإجابة الصحيحة تماماً كما كُتبت في الخيارات",
        "explanation": "شرح منطقي مختصر لكيفية الوصول للإجابة"
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        raw_text = response.text.strip()
        # تنظيف الرد من علامات الـ Markdown إذا وجدت
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
            
        return json.loads(raw_text.strip())
    except Exception as e:
        st.error(f"حدث خطأ أثناء توليد السؤال: {e}")
        return None

# ================= الواجهة الرئيسية =================

st.title("🧠 منصة التقييم المعرفي الذكية")
st.markdown("قياس دقيق للقدرات الذهنية متوافق مع المعايير العالمية ومعتمد على الذكاء الاصطناعي.")

# 1. شاشة الإعدادات والبدء
if st.session_state.step == 'setup':
    st.write("---")
    col1, col2 = st.columns(2)
    with col1:
        age_input = st.number_input("أدخل عمرك:", min_value=7, max_value=120, value=25)
    with col2:
        questions_count = st.selectbox("عدد أسئلة الاختبار:", [5, 10, 15, 20], index=1)
        
    st.warning("⚠️ الرجاء إدخال مفتاح الـ API في القائمة الجانبية قبل البدء.")
    
    if st.button("🚀 بدء التقييم الآن"):
        if not api_key_input:
            st.error("يرجى إدخال مفتاح API أولاً للمتابعة.")
        else:
            st.session_state.user_age = age_input
            st.session_state.total_questions = questions_count
            st.session_state.step = 'testing'
            with st.spinner("جاري إعداد بيئة الاختبار وتوليد السؤال الأول..."):
                st.session_state.current_q = generate_question(age_input, current_difficulty=2)
            st.rerun()

# 2. شاشة الاختبار
elif st.session_state.step == 'testing':
    progress_val = st.session_state.questions_answered / st.session_state.total_questions
    st.progress(progress_val)
    st.caption(f"السؤال {st.session_state.questions_answered + 1} من {st.session_state.total_questions}")
    
    q_data = st.session_state.current_q
    
    if q_data:
        st.markdown(f'<div class="question-card"><h4>{q_data["question"]}</h4><br><small>الفئة: {q_data["category"]}</small></div>', unsafe_allow_html=True)
        
        with st.form(key='question_form'):
            user_choice = st.radio("اختر الإجابة الصحيحة:", q_data['options'], index=None)
            submit_btn = st.form_submit_button("تأكيد ومتابعة")
            
            if submit_btn:
                if user_choice is None:
                    st.error("الرجاء اختيار إجابة أولاً.")
                else:
                    # تحديث الإحصائيات للفئة
                    cat = q_data["category"]
                    if cat in st.session_state.category_scores:
                        st.session_state.category_scores[cat]["total"] += 1
                        
                    # التحقق من الإجابة
                    is_correct = (user_choice == q_data['answer'])
                    if is_correct:
                        st.session_state.score += 1
                        if cat in st.session_state.category_scores:
                            st.session_state.category_scores[cat]["correct"] += 1
                    
                    st.session_state.questions_answered += 1
                    
                    if st.session_state.questions_answered >= st.session_state.total_questions:
                        st.session_state.step = 'results'
                    else:
                        # تحديد الصعوبة القادمة بناءً على الإجابة (Adaptive Logic)
                        next_diff = 3 if is_correct else 2
                        if st.session_state.score / max(1, st.session_state.questions_answered) > 0.8:
                            next_diff = 4
                            
                        with st.spinner("جاري تحليل الإجابة وتوليد السؤال التالي..."):
                            st.session_state.current_q = generate_question(st.session_state.user_age, next_diff)
                    st.rerun()

# 3. شاشة النتائج
elif st.session_state.step == 'results':
    st.balloons()
    st.header("📊 التقرير النهائي للتقييم")
    
    # حساب نسبة الـ IQ التقديرية (تبسيط برمجي)
    accuracy = st.session_state.score / st.session_state.total_questions
    estimated_iq = int(70 + (accuracy * 70)) # نطاق من 70 لـ 140
    
    # عرض النتيجة الرئيسية
    col1, col2 = st.columns(2)
    with col1:
        st.metric("معدل الذكاء التقديري (IQ)", f"{estimated_iq}")
    with col2:
        if estimated_iq >= 130:
            eval_text = "عبقري استثنائي 🌟"
        elif estimated_iq >= 115:
            eval_text = "أعلى من المتوسط بكثير 📈"
        elif estimated_iq >= 90:
            eval_text = "متوسط طبيعي ذهبي ⚖️"
        else:
            eval_text = "يحتاج لتمرين ذهني إضافي 🧠"
        st.metric("التقييم العام", eval_text)
        
    st.write("---")
    st.subheader("تحليل القدرات المعرفية التفصيلي")
    
    # تجهيز بيانات الرسم البياني
    categories = []
    percentages = []
    
    for cat, stats in st.session_state.category_scores.items():
        categories.append(cat)
        if stats["total"] > 0:
            percentages.append((stats["correct"] / stats["total"]) * 100)
        else:
            percentages.append(0)
            
    # رسم بياني راداري احترافي باستخدام Plotly
    fig = go.Figure()
    fig.add_trace(go.Scatterpolar(
        r=percentages,
        theta=categories,
        fill='toself',
        name='أدائك',
        line_color='#2e6c80',
        fillcolor='rgba(46, 108, 128, 0.4)'
    ))

    fig.update_layout(
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, 100]
            )),
        showlegend=False,
        margin=dict(l=40, r=40, t=20, b=20)
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    if st.button("🔄 إعادة الاختبار"):
        for key in list(st.session_state.keys()):
            del st.session_state[key]
        st.rerun()

# -*- coding: utf-8 -*-
import streamlit as st
import google.generativeai as genai
import pandas as pd
import plotly.express as px
import json
import os

# --- 1. CONFIGURATION & THEME ---
st.set_page_config(
    page_title="Gemini 3.0 Market Analyst",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS to enforce "Pink" highlights if the theme isn't set in config
st.markdown("""
    <style>
    .stButton>button {
        background-color: #ff4b4b;
        color: white;
    }
    .stTabs [data-baseweb="tab-list"] button [data-testid="stMarkdownContainer"] p {
        font-size: 1.1rem;
    }
    </style>
""", unsafe_allow_html=True)

# --- 2. AUTHENTICATION ---
# Lấy API Key từ Streamlit Secrets (An toàn cho GitHub)
if "GEMINI_API_KEY" in st.secrets:
    api_key = st.secrets["GEMINI_API_KEY"]
    genai.configure(api_key=api_key)
else:
    st.warning("⚠️ Chưa tìm thấy API Key. Vui lòng thiết lập trong Streamlit Secrets.")
    st.stop()

# --- 3. MODEL SETUP ---
def get_gemini_response(topic):
    """
    Hàm gọi Gemini 3.0 Pro Preview với tính năng Google Search (Grounding)
    và yêu cầu trả về định dạng JSON thuần.
    """
    # Cấu hình Model
    # Lưu ý: Tên model có thể thay đổi tùy theo thời điểm Google phát hành bản Preview
    model_name = "gemini-1.5-pro-002" # Fallback ổn định, hãy đổi thành 'gemini-3.0-pro-preview' nếu đã có quyền truy cập
    
    # Cấu hình Tool (Google Search Grounding)
    tools = [
        {"google_search": {}} 
    ]

    model = genai.GenerativeModel(
        model_name,
        tools=tools
    )

    # Prompt yêu cầu cấu trúc JSON cụ thể để vẽ biểu đồ
    prompt = f"""
    You are a senior market research analyst. Perform a deep analysis of: "{topic}".
    Use Google Search to find real-time data.
    
    Return the output STRICTLY as a valid JSON object with the following structure:
    {{
        "product_profile": {{
            "name": "Product Name",
            "summary": "A detailed 3-sentence summary.",
            "release_date": "YYYY-MM-DD",
            "price_range": "$X - $Y"
        }},
        "radar_data": {{
            "categories": ["Innovation", "Price/Value", "Brand Power", "User Reviews", "Features"],
            "values": [8, 7, 9, 8, 9] 
        }},
        "competitors": [
            {{"Name": "Competitor A", "Price": 100, "Market_Share": "20%", "Verdict": "Cheaper but less features"}},
            {{"Name": "Competitor B", "Price": 150, "Market_Share": "15%", "Verdict": "Premium alternative"}}
        ],
        "key_insights": ["Insight 1", "Insight 2", "Insight 3"]
    }}
    
    Ensure the JSON is valid and contains no markdown formatting (like ```json).
    """

    try:
        # Cấu hình trả về JSON mode (nếu model hỗ trợ) hoặc parse thủ công
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
    except Exception as e:
        st.error(f"Lỗi khi gọi Gemini: {e}")
        return None

# --- 4. UI LAYOUT ---
st.title("🧠 Gemini 3.0 Market Analyst")
st.caption("Powered by Google AI Studio • Grounded with Google Search")

with st.sidebar:
    st.header("🎯 Input")
    topic_input = st.text_input("Sản phẩm hoặc Công ty cần phân tích:", placeholder="Ví dụ: iPhone 16 Pro Max")
    analyze_btn = st.button("🚀 Phân tích ngay")
    st.divider()
    st.info("Ứng dụng sử dụng mô hình lập luận phức tạp để phân tích thị trường thực tế.")

# --- 5. MAIN LOGIC ---
if analyze_btn and topic_input:
    with st.spinner(f"Đang phân tích '{topic_input}' qua nhiều nguồn dữ liệu..."):
        data = get_gemini_response(topic_input)

    if data:
        # Tạo Tabs giao diện
        tab1, tab2, tab3 = st.tabs(["📝 Product Profile", "🕸️ Radar Analysis", "⚔️ Competitors"])

        # TAB 1: PRODUCT PROFILE
        with tab1:
            st.subheader(data["product_profile"]["name"])
            col1, col2 = st.columns([2, 1])
            with col1:
                st.write(data["product_profile"]["summary"])
                st.success(f"**Price Range:** {data['product_profile']['price_range']}")
            with col2:
                st.write("**Key Insights:**")
                for insight in data["key_insights"]:
                    st.write(f"- {insight}")

        # TAB 2: RADAR CHART
        with tab2:
            st.subheader("📊 Đánh giá đa chiều")
            
            radar_info = data["radar_data"]
            df_radar = pd.DataFrame(dict(
                r=radar_info["values"],
                theta=radar_info["categories"]
            ))
            
            fig = px.line_polar(df_radar, r='r', theta='theta', line_close=True,
                                title=f"Biểu đồ năng lực: {topic_input}")
            fig.update_traces(fill='toself', line_color='#ff4b4b') # Pink color match
            fig.update_layout(polar=dict(radialaxis=dict(visible=True, range=[0, 10])))
            
            st.plotly_chart(fig, use_container_width=True)

        # TAB 3: COMPETITORS TABLE
        with tab3:
            st.subheader("Đối thủ cạnh tranh trực tiếp")
            df_comp = pd.DataFrame(data["competitors"])
            
            # Highlight các dòng có giá trị đặc biệt (ví dụ demo)
            st.dataframe(
                df_comp,
                use_container_width=True,
                hide_index=True,
                column_config={
                    "Price": st.column_config.NumberColumn(format="$%d"),
                }
            )

    else:
        st.error("Không thể lấy dữ liệu. Vui lòng thử lại.")
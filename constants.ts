import { Language } from "./types";

export const TRANSLATIONS = {
  [Language.VN]: {
    title: "SweetTech R&D Mate",
    subtitle: "Trợ lý R&D Ngành Bánh Kẹo",
    inputPlaceholder: "Nhập tên sản phẩm, mô tả hoặc tải lên hình ảnh/âm thanh...",
    analyzeBtn: "Phân Tích Ngay",
    cancelBtn: "Hủy",
    analyzing: "Đang phân tích dữ liệu thị trường và thành phần...",
    uploadLabel: "Tải lên",
    cameraLabel: "Chụp ảnh",
    voiceLabel: "Ghi âm",
    printBtn: "In báo cáo",
    exportPdfBtn: "Xuất PDF",
    exportTxtBtn: "Xuất .TXT",
    generatingPdf: "Đang tạo PDF...",
    sections: {
      profile: "Hồ sơ sản phẩm",
      ingredients: "Phân tích nguyên liệu",
      labelIngredients: "Thành phần trên nhãn",
      mainIngredients: "Thành phần chính",
      additives: "Phụ gia",
      allergens: "Thông tin dị ứng",
      specs: "Chỉ số kỹ thuật (Ước tính)",
      benchmark: "So sánh đối thủ",
      insights: "R&D Insights & Cải tiến",
      reviews: "Đánh giá khách hàng",
      sources: "Nguồn dữ liệu",
      manufacturer: "Nhà sản xuất",
      importer: "Nhà nhập khẩu/Phân phối",
      persona: "Chân dung khách hàng",
      targetAudience: "Khách hàng mục tiêu",
      expansionPotential: "Tiềm năng mở rộng"
    },
    tableHeaders: {
      competitor: "Sản phẩm",
      price: "Giá/100g",
      usp: "Điểm bán hàng (USP)",
      sensory: "Cảm quan",
      nutrition: "Dinh dưỡng"
    }
  },
  [Language.EN]: {
    title: "SweetTech R&D Mate",
    subtitle: "Confectionery R&D Assistant",
    inputPlaceholder: "Enter product name, description, or upload image/audio...",
    analyzeBtn: "Analyze Now",
    cancelBtn: "Cancel",
    analyzing: "Analyzing market data and ingredients...",
    uploadLabel: "Upload",
    cameraLabel: "Camera",
    voiceLabel: "Voice",
    printBtn: "Print Report",
    exportPdfBtn: "Export PDF",
    exportTxtBtn: "Export .TXT",
    generatingPdf: "Generating PDF...",
    sections: {
      profile: "Product Profile",
      ingredients: "Ingredient Analysis",
      labelIngredients: "Label Ingredients",
      mainIngredients: "Main Ingredients",
      additives: "Additives",
      allergens: "Allergen Information",
      specs: "Tech Specs (Est.)",
      benchmark: "Benchmarking",
      insights: "R&D Insights & Improvements",
      reviews: "Consumer Reviews",
      sources: "Data Sources",
      manufacturer: "Manufacturer",
      importer: "Importer/Distributor",
      persona: "Customer Persona",
      targetAudience: "Target Audience",
      expansionPotential: "Expansion Potential"
    },
    tableHeaders: {
      competitor: "Product",
      price: "Price/100g",
      usp: "USP",
      sensory: "Sensory",
      nutrition: "Nutrition"
    }
  },
  [Language.KR]: {
    title: "SweetTech R&D Mate",
    subtitle: "제과 R&D 어시스턴트",
    inputPlaceholder: "제품명, 설명을 입력하거나 이미지/오디오를 업로드하세요...",
    analyzeBtn: "분석 시작",
    cancelBtn: "취소",
    analyzing: "시장 데이터 및 성분 분석 중...",
    uploadLabel: "업로드",
    cameraLabel: "카메라",
    voiceLabel: "음성",
    printBtn: "보고서 인쇄",
    exportPdfBtn: "PDF 내보내기",
    exportTxtBtn: ".TXT 내보내기",
    generatingPdf: "PDF 생성 중...",
    sections: {
      profile: "제품 프로필",
      ingredients: "성분 분석",
      labelIngredients: "라벨 성분",
      mainIngredients: "주요 성분",
      additives: "첨가물",
      allergens: "알레르기 정보",
      specs: "기술 사양 (추정)",
      benchmark: "경쟁사 벤치마킹",
      insights: "R&D 인사이트 및 개선",
      reviews: "고객 리뷰",
      sources: "데이터 출처",
      manufacturer: "제조사",
      importer: "수입사/유통사",
      persona: "고객 페르소나",
      targetAudience: "타겟 고객",
      expansionPotential: "확장 가능성"
    },
    tableHeaders: {
      competitor: "제품",
      price: "가격/100g",
      usp: "USP",
      sensory: "관능",
      nutrition: "영양성분"
    }
  }
};

export const SYSTEM_INSTRUCTION = `
You are "SweetTech R&D Mate", an AI expert for the Confectionery R&D industry. 
Your task is to analyze product inputs (text/image/audio) and generate a structured R&D report.

Follow these strict steps:
1.  **Product Profiling:** Identify Name, Brand, Weight, Price, Type, Origin, Manufacturer, and Importer (if imported). Extract the full ingredient list exactly as written on the label. Also, provide a simplified list of main ingredients. Identify E-numbers (Codex) and explain their function. Identify and list all potential allergens (e.g., milk, soy, nuts, gluten) mentioned on the label or in the ingredients. Estimate Moisture, Brix, Texture, Flavor.
2.  **Benchmarking:** Find 3 direct competitors (Prioritize Vietnam/Asia markets). Compare Price/100g, USP, Sensory (Sweet/Sour/Texture), Nutrition (Energy, Sugar, Fat, Salt).
3.  **Insights:** 
    - Generate data for a Radar Chart (1-10 scale) for: Sweetness, Sourness, Aroma, Hardness/Chewiness, Appearance.
    - SWOT Analysis.
    - 3 Specific R&D Improvement Ideas (e.g., substitute ingredients, new flavors).
4.  **Reviews:** Find or simulate realistic customer reviews. Then, analyze these reviews to provide a concise summary and a list of key themes (e.g., "Too sweet", "Good value", "Packaging issues").
5.  **Customer Persona:** Describe the current target audience (demographics, habits, needs). Then, suggest 2-3 potential new customer segments for market expansion.

**OUTPUT FORMAT:**
Return **ONLY** raw JSON data. Do not use Markdown code blocks (\`\`\`json).
The JSON must match this structure:
{
  "profile": {
    "name": "...", "brand": "...", "netWeight": "...", "price": "...", "type": "...", "origin": "...", "manufacturer": "...", "importer": "...",
    "labelIngredients": "Full ingredient list from the package...",
    "ingredients": ["..."],
    "additives": [{"code": "E123", "name": "...", "function": "..."}],
    "allergens": ["milk", "soy"],
    "specs": { "moisture": "...", "brix": "...", "texture": "...", "flavorProfile": "..." }
  },
  "competitors": [
    {
      "name": "...", "pricePer100g": "...", "usp": "...",
      "sensory": { "sweetness": "...", "texture": "...", "aftertaste": "..." },
      "nutrition": { "energy": "...", "sugar": "...", "fat": "...", "salt": "..." }
    }
  ],
  "radarChart": [
    { "subject": "Sweetness", "A": 8, "fullMark": 10 },
    { "subject": "Sourness", "A": 4, "fullMark": 10 },
    { "subject": "Aroma", "A": 7, "fullMark": 10 },
    { "subject": "Texture", "A": 9, "fullMark": 10 },
    { "subject": "Appearance", "A": 8, "fullMark": 10 }
  ],
  "swot": { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] },
  "improvements": [{ "title": "...", "description": "..." }],
  "reviews": {
    "summary": "Overall, customers love the texture but find it a bit too sweet...",
    "keyThemes": ["Great texture", "Too sweet", "Good for kids"],
    "items": [{ "source": "Shopee", "content": "...", "rating": 5 }]
  },
  "persona": {
    "targetAudience": "Description of the primary customer segment...",
    "expansionPotential": ["Suggestion 1 for a new segment...", "Suggestion 2..."]
  },
  "sources": ["url1", "url2"]
}
`;
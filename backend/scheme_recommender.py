"""
Saarthi — Personalised Multilingual Scheme Recommendation Engine
Rule-based engine with gpt-5.4-nano for multilingual output.
"""

from __future__ import annotations
import json
from typing import Optional
from openai import OpenAI
import os

# ---------------------------------------------------------------------------
# Scheme Database — 22 schemes with structured eligibility criteria
# ---------------------------------------------------------------------------

SCHEMES: list[dict] = [
    # ── Agriculture ──────────────────────────────────────────────────────────
    {
        "id": "pm_kisan",
        "name": "PM-KISAN",
        "full_name": "Pradhan Mantri Kisan Samman Nidhi",
        "icon": "🌾",
        "category": "Agriculture",
        "description": "A central sector scheme providing income support to all landholding farmer families in India to supplement their financial needs for procuring various inputs.",
        "benefit": "₹6,000 per year in three equal installments",
        "how_to_apply": "Apply online at pmkisan.gov.in using the 'New Farmer Registration' link or visit a Common Service Centre (CSC) with land records and Aadhaar.",
        "eligibility": {
            "occupations": ["farmer"],
            "max_income": None,
            "min_land_acres": 0.01,
            "max_land_acres": None,
            "min_age": None,
            "max_age": None,
            "states": None,
        },
    },
    {
        "id": "pmfby",
        "name": "PMFBY",
        "full_name": "Pradhan Mantri Fasal Bima Yojana",
        "icon": "🌧️",
        "category": "Agriculture",
        "description": "A crop insurance scheme that provides financial support to farmers suffering crop loss or damage arising out of unforeseen events.",
        "benefit": "Comprehensive insurance cover against crop failure",
        "how_to_apply": "Register on the PMFBY portal (pmfby.gov.in), through your bank, or via an authorized insurance intermediary during the sowing season.",
        "eligibility": {
            "occupations": ["farmer"],
            "max_income": None,
            "min_land_acres": 0.01,
            "max_land_acres": None,
            "min_age": None,
            "max_age": None,
            "states": None,
        },
    },
    {
        "id": "soil_health",
        "name": "Soil Health Card",
        "full_name": "Soil Health Card Scheme",
        "icon": "🪴",
        "category": "Agriculture",
        "description": "Provides farmers with crop-wise recommendations of nutrients and fertilizers required for their individual farms to help them improve productivity through judicious use of inputs.",
        "benefit": "Personalized nutrient advisory every 2 years",
        "how_to_apply": "Farmers can contact their local Agriculture Department officials or Gram Panchayat to have their soil collected and tested.",
        "eligibility": {
            "occupations": ["farmer"],
            "max_income": None,
            "min_land_acres": 0.01,
            "max_land_acres": None,
            "min_age": None,
            "max_age": None,
            "states": None,
        },
    },
    {
        "id": "kcc",
        "name": "Kisan Credit Card",
        "full_name": "Kisan Credit Card (KCC)",
        "icon": "💳",
        "category": "Agriculture",
        "description": "Provides farmers with timely access to credit for their cultivation and other needs, including post-harvest expenses and consumption requirements.",
        "benefit": "Flexible credit up to ₹3 lakh at 4% effective interest",
        "how_to_apply": "Approach your nearest commercial bank, RRB, or Cooperative Bank with land records, Aadhaar, and a photograph.",
        "eligibility": {
            "occupations": ["farmer"],
            "max_income": None,
            "min_land_acres": 0.01,
            "max_land_acres": None,
            "min_age": 18,
            "max_age": None,
            "states": None,
        },
    },
    {
        "id": "pm_kusum",
        "name": "PM-KUSUM",
        "full_name": "PM Kisan Urja Suraksha evam Utthan Mahabhiyan",
        "icon": "☀️",
        "category": "Agriculture",
        "description": "Aims to provide energy security to farmers and de-dieselize the farm sector by installing solar pumps and solar power plants on barren lands.",
        "benefit": "60% subsidy and 30% loan for solar water pumps",
        "how_to_apply": "Apply through the official state-specific portal of the DISCOM or the State Renewable Energy Agency as listed on mnre.gov.in.",
        "eligibility": {
            "occupations": ["farmer"],
            "max_income": None,
            "min_land_acres": 1.0,
            "max_land_acres": None,
            "min_age": None,
            "max_age": None,
            "states": None,
        },
    },

    # ── Health ────────────────────────────────────────────────────────────────
    {
        "id": "ayushman",
        "name": "Ayushman Bharat",
        "full_name": "Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
        "icon": "🏥",
        "category": "Health",
        "description": "The world's largest health insurance scheme, providing free secondary and tertiary healthcare to the bottom 40% of India's population.",
        "benefit": "Cashless health cover of ₹5 lakh per family per year",
        "how_to_apply": "Check your name in the SECC list or PM-JAY database via beneficiary.nha.gov.in and visit an Ayushman Kendra with your Aadhaar card.",
        "eligibility": {
            "occupations": None,
            "max_income": 500000,
            "min_land_acres": None,
            "max_land_acres": None,
            "min_age": None,
            "max_age": None,
            "states": None,
        },
    },
    {
        "id": "esic",
        "name": "ESIC Health Scheme",
        "full_name": "Employees' State Insurance Scheme",
        "icon": "🩺",
        "category": "Health",
        "description": "A multidimensional social security system that provides medical care and cash benefits to employees in the organized sector during sickness, maternity, or injury.",
        "benefit": "Full medical care for self and family with no upper limit",
        "how_to_apply": "Registration is done by the employer. Employees should obtain an ESI Pehchan card for themselves and their dependents.",
        "eligibility": {
            "occupations": ["labour", "msme"],
            "max_income": 300000,
            "min_land_acres": None,
            "max_land_acres": None,
            "min_age": 18,
            "max_age": None,
            "states": None,
        },
    },

    # ── Housing ───────────────────────────────────────────────────────────────
    {
        "id": "pm_awas_gramin",
        "name": "PM Awas Yojana – Gramin",
        "full_name": "Pradhan Mantri Awas Yojana – Gramin",
        "icon": "🏡",
        "category": "Housing",
        "description": "Aims to provide a pucca house with basic amenities to all houseless householders and those living in kutcha or dilapidated houses in rural areas.",
        "benefit": "Grant of ₹1.2 lakh to ₹1.3 lakh for house construction",
        "how_to_apply": "Beneficiaries are identified based on SECC 2011 data. Contact your Gram Panchayat or Block Development Office to check your status.",
        "eligibility": {
            "occupations": None,
            "max_income": 300000,
            "min_land_acres": None,
            "max_land_acres": None,
            "min_age": 18,
            "max_age": None,
            "states": None,
        },
    },

    # ── Energy ────────────────────────────────────────────────────────────────
    {
        "id": "ujjwala",
        "name": "PM Ujjwala Yojana",
        "full_name": "Pradhan Mantri Ujjwala Yojana",
        "icon": "🔥",
        "category": "Energy",
        "description": "Aims to safeguard the health of women and children by providing them with a clean cooking fuel – LPG, so that they don’t have to compromise their health in smoky kitchens.",
        "benefit": "Free first LPG cylinder, stove, and deposit-free connection",
        "how_to_apply": "Apply at the nearest LPG distributor (Indane, Bharatgas, or HP Gas) with Aadhaar, Ration Card, and BPL documents.",
        "eligibility": {
            "occupations": None,
            "max_income": 200000,
            "min_land_acres": None,
            "max_land_acres": None,
            "min_age": 18,
            "max_age": None,
            "states": None,
        },
    },

    # ── Banking & Financial Inclusion ─────────────────────────────────────────
    {
        "id": "jan_dhan",
        "name": "Jan Dhan Yojana",
        "full_name": "Pradhan Mantri Jan Dhan Yojana",
        "icon": "🏦",
        "category": "Banking",
        "description": "A national mission for financial inclusion to ensure access to financial services namely, basic savings & deposit accounts, remittance, credit, insurance, and pension.",
        "benefit": "No minimum balance account + ₹2 lakh accident insurance",
        "how_to_apply": "Open an account at any bank branch or Business Correspondent (Bank Mitra) outlet with your Aadhaar card and a photograph.",
        "eligibility": {
            "occupations": None,
            "max_income": None,
            "min_land_acres": None,
            "max_land_acres": None,
            "min_age": 10,
            "max_age": None,
            "states": None,
        },
    },
    {
        "id": "atal_pension",
        "name": "Atal Pension Yojana",
        "full_name": "Atal Pension Yojana (APY)",
        "icon": "🧾",
        "category": "Banking",
        "description": "Focuses on the unorganized sector to provide a guaranteed minimum pension of ₹1,000 to ₹5,000 per month after the age of 60.",
        "benefit": "Guaranteed monthly pension for life after age 60",
        "how_to_apply": "Approach your bank branch where you have a savings account and fill up the APY registration form.",
        "eligibility": {
            "occupations": ["labour", "farmer", "other"],
            "max_income": None,
            "min_land_acres": None,
            "max_land_acres": None,
            "min_age": 18,
            "max_age": 40,
            "states": None,
        },
    },

    # ── Education ─────────────────────────────────────────────────────────────
    {
        "id": "nsp",
        "name": "National Scholarship",
        "full_name": "National Scholarship Portal (NSP)",
        "icon": "📚",
        "category": "Education",
        "description": "A digital portal that provides a common platform for various scholarship schemes implemented by various Central Ministries and State Governments.",
        "benefit": "Direct scholarship amount into student's bank account",
        "how_to_apply": "Register and apply on scholarships.gov.in. Upload documents like Aadhaar, marksheet, and income certificate as required.",
        "eligibility": {
            "occupations": ["student"],
            "max_income": None,
            "min_land_acres": None,
            "max_land_acres": None,
            "min_age": None,
            "max_age": 30,
            "states": None,
        },
    },
    {
        "id": "post_matric",
        "name": "Post-Matric Scholarship",
        "full_name": "Post-Matric Scholarship for SC/ST/OBC/Minority",
        "icon": "🎓",
        "category": "Education",
        "description": "Financial assistance to students from marginalized communities to enable them to pursue higher education from Class 11 onwards, including technical and professional courses.",
        "benefit": "Full tuition fee waiver and monthly maintenance allowance",
        "how_to_apply": "Apply through the National Scholarship Portal or your respective state's scholarship portal during the academic year.",
        "eligibility": {
            "occupations": ["student"],
            "max_income": 250000,
            "min_land_acres": None,
            "max_land_acres": None,
            "min_age": None,
            "max_age": 30,
            "states": None,
        },
    },

    # ── Skill & Employment ────────────────────────────────────────────────────
    {
        "id": "pmkvy",
        "name": "PMKVY Skill Training",
        "full_name": "Pradhan Mantri Kaushal Vikas Yojana",
        "icon": "🛠️",
        "category": "Skill Development",
        "description": "Aims to enable a large number of Indian youth to take up industry-relevant skill training that will help them in securing a better livelihood.",
        "benefit": "NSDC certified skill training and placement assistance",
        "how_to_apply": "Register at pmkvyofficial.org and choose a training center near you for your desired job role.",
        "eligibility": {
            "occupations": ["student", "labour", "other"],
            "max_income": None,
            "min_land_acres": None,
            "max_land_acres": None,
            "min_age": 15,
            "max_age": 45,
            "states": None,
        },
    },
    {
        "id": "nrega",
        "name": "MGNREGA",
        "full_name": "Mahatma Gandhi National Rural Employment Guarantee Act",
        "icon": "👷",
        "category": "Employment",
        "description": "Provides at least 100 days of guaranteed wage employment in every financial year to every rural household whose adult members volunteer to do unskilled manual work.",
        "benefit": "100 days of guaranteed work at state-notified wages",
        "how_to_apply": "Apply to the local Gram Panchayat for a Job Card. Work is provided within 15 days of demand.",
        "eligibility": {
            "occupations": ["labour", "farmer", "other"],
            "max_income": None,
            "min_land_acres": None,
            "max_land_acres": None,
            "min_age": 18,
            "max_age": None,
            "states": None,
        },
    },

    # ── MSME & Entrepreneurship ───────────────────────────────────────────────
    {
        "id": "mudra",
        "name": "PM Mudra Yojana",
        "full_name": "Pradhan Mantri MUDRA Yojana",
        "icon": "💼",
        "category": "Business",
        "description": "Provides loans to non-corporate, non-farm small/micro enterprises. These loans are classified as Shishu, Kishor, and Tarun based on the stage of growth.",
        "benefit": "Collateral-free business loans up to ₹10 lakh",
        "how_to_apply": "Submit a business plan to any public/private sector bank or MFI. No processing fee for Shishu loans.",
        "eligibility": {
            "occupations": ["msme", "labour", "other", "farmer"],
            "max_income": None,
            "min_land_acres": None,
            "max_land_acres": None,
            "min_age": 18,
            "max_age": None,
            "states": None,
        },
    },
    {
        "id": "startup_india",
        "name": "Startup India Seed Fund",
        "full_name": "Startup India Seed Fund Scheme",
        "icon": "🚀",
        "category": "Business",
        "description": "Provides financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialization.",
        "benefit": "Seed funding up to ₹50 lakh through selected incubators",
        "how_to_apply": "Startups should apply through the Startup India portal (seedfund.startupindia.gov.in) to incubator(s) of their choice.",
        "eligibility": {
            "occupations": ["msme"],
            "max_income": None,
            "min_land_acres": None,
            "max_land_acres": None,
            "min_age": 18,
            "max_age": None,
            "states": None,
        },
    },
    {
        "id": "stand_up_india",
        "name": "Stand-Up India",
        "full_name": "Stand-Up India Scheme",
        "icon": "📈",
        "category": "Business",
        "description": "Aims to facilitate bank loans to at least one SC or ST borrower and at least one woman borrower per bank branch for setting up a greenfield enterprise.",
        "benefit": "Loans between ₹10 lakh and ₹1 crore for new businesses",
        "how_to_apply": "Apply through the portal standupmitra.in or directly at any bank branch.",
        "eligibility": {
            "occupations": ["msme"],
            "max_income": None,
            "min_land_acres": None,
            "max_land_acres": None,
            "min_age": 18,
            "max_age": None,
            "states": None,
        },
    },
    {
        "id": "agri_infra",
        "name": "Agri Infrastructure Fund",
        "full_name": "Agriculture Infrastructure Fund (AIF)",
        "icon": "🏗️",
        "category": "Agriculture",
        "description": "A financing facility for investment in viable projects for post-harvest management infrastructure and community farming assets through interest subvention.",
        "benefit": "3% yearly interest subvention on loans up to ₹2 crore",
        "how_to_apply": "Register and apply on the AIF portal (agriinfra.dac.gov.in). Beneficiaries include farmers, SHGs, and startups.",
        "eligibility": {
            "occupations": ["farmer", "msme"],
            "max_income": None,
            "min_land_acres": None,
            "max_land_acres": None,
            "min_age": 18,
            "max_age": None,
            "states": None,
        },
    },

    # ── Social Security ───────────────────────────────────────────────────────
    {
        "id": "ignoaps",
        "name": "Old Age Pension",
        "full_name": "Indira Gandhi National Old Age Pension Scheme",
        "icon": "👴",
        "category": "Social Security",
        "description": "A non-contributory pension scheme for older Indians from households below the poverty line.",
        "benefit": "Monthly pension of ₹200 to ₹500 depending on age",
        "how_to_apply": "Apply at the local Social Welfare Office or Gram Panchayat with age and BPL proof.",
        "eligibility": {
            "occupations": None,
            "max_income": 200000,
            "min_land_acres": None,
            "max_land_acres": None,
            "min_age": 60,
            "max_age": None,
            "states": None,
        },
    },
    {
        "id": "widow_pension",
        "name": "Widow Pension",
        "full_name": "Indira Gandhi National Widow Pension Scheme",
        "icon": "🤲",
        "category": "Social Security",
        "description": "Provides financial assistance through monthly pensions to widows belonging to Below Poverty Line (BPL) households.",
        "benefit": "Monthly pension of ₹300 (plus state top-up)",
        "how_to_apply": "Apply through your Gram Panchayat or the Block/District Social Welfare Office with death certificate of spouse.",
        "eligibility": {
            "occupations": None,
            "max_income": 200000,
            "min_land_acres": None,
            "max_land_acres": None,
            "min_age": 40,
            "max_age": 79,
            "states": None,
        },
    },
    {
        "id": "bima_sakhi",
        "name": "Bima Sakhi Yojana",
        "full_name": "Bima Sakhi (LIC)",
        "icon": "🛡️",
        "category": "Social Security",
        "description": "A program to empower rural women by training them as micro-insurance agents to spread financial awareness and insurance penetration.",
        "benefit": "Skill training + Commission-based income + Stipend",
        "how_to_apply": "Contact the nearest LIC Branch Office or visit licindia.in to find out about recruitment for micro-insurance agents.",
        "eligibility": {
            "occupations": None,
            "max_income": None,
            "min_land_acres": None,
            "max_land_acres": None,
            "min_age": 18,
            "max_age": 70,
            "states": None,
        },
    },
]

# ---------------------------------------------------------------------------
# Recommendation Logic
# ---------------------------------------------------------------------------

def _scheme_matches(scheme: dict, profile: dict) -> bool:
    """Pure Python rule check — no API calls."""
    eligibility = scheme["eligibility"]
    occupation = profile.get("occupation", "other").lower()
    income = profile.get("income", 0) or 0
    land_size = profile.get("land_size", 0) or 0
    age = profile.get("age", 25) or 25

    # Occupation check
    if eligibility["occupations"] is not None:
        if occupation not in eligibility["occupations"]:
            return False

    # Income check
    if eligibility["max_income"] is not None:
        if income > eligibility["max_income"]:
            return False

    # Land size checks
    if eligibility["min_land_acres"] is not None:
        if land_size < eligibility["min_land_acres"]:
            return False

    # Age checks
    if eligibility["min_age"] is not None:
        if age < eligibility["min_age"]:
            return False
    if eligibility["max_age"] is not None:
        if age > eligibility["max_age"]:
            return False

    return True


def recommend_schemes(profile: dict, language: str = "English", llm=None, vector_db=None) -> list[dict]:
    """
    Returns eligible schemes enriched with content from PDFs (via RAG).

    Flow:
    1. Rule-based filter → matched schemes (fast, deterministic)
    2. For each matched scheme, query the vector store for PDF content
    3. Use gpt-5.4-nano to extract structured fields (description, benefit, how_to_apply)
       from the retrieved PDF chunks
    4. Optionally translate the final cards if language != English

    Falls back to hardcoded text if no PDF chunk is found for a scheme.
    """
    matched = [s for s in SCHEMES if _scheme_matches(s, profile)]

    if not matched:
        return []

    # ── Enrich scheme cards from PDF vector store ──────────────────────────
    if vector_db and llm:
        enriched = []
        for scheme in matched:
            search_query = f"{scheme['name']} {scheme['full_name']} government scheme India"
            try:
                docs = vector_db.similarity_search(search_query, k=4)
                if docs:
                    # Combine retrieved chunks into a single context block
                    context = "\n\n".join(d.page_content for d in docs)
                    extract_prompt = (
                        f"You are a helpful assistant. Using ONLY the following document text, "
                        f"extract information about the government scheme '{scheme['full_name']}'.\n\n"
                        f"Document text:\n{context}\n\n"
                        f"Provide a JSON object with exactly these keys:\n"
                        f"- description: 1-2 simple sentences about what the scheme does (simple words, no jargon)\n"
                        f"- benefit: the main financial/material benefit (e.g. '₹6,000/year' or 'Free LPG connection')\n"
                        f"- how_to_apply: 1-2 sentences on how to apply\n\n"
                        f"If the document does not contain enough information about this scheme, "
                        f"reply with the word NULL.\n\n"
                        f"Return ONLY valid JSON, no markdown, no extra text."
                    )
                    resp = llm.invoke(extract_prompt)
                    raw = resp.content.strip()
                    if raw.upper() != "NULL" and raw:
                        # Robust JSON extraction helper
                        import re as _re
                        import json as _json
                        
                        # Try to find JSON block in triple backticks
                        match = _re.search(r'```(?:json)?\s*(\{.*?\})\s*```', raw, _re.DOTALL)
                        if match:
                            raw_json = match.group(1)
                        else:
                            # Try to find the first '{' and last '}'
                            match = _re.search(r'(\{.*\})', raw, _re.DOTALL)
                            raw_json = match.group(1) if match else raw

                        try:
                            extracted = _json.loads(raw_json)
                            merged = dict(scheme)
                            merged["description"] = extracted.get("description", scheme["description"])
                            merged["benefit"] = extracted.get("benefit", scheme["benefit"])
                            merged["how_to_apply"] = extracted.get("how_to_apply", scheme["how_to_apply"])
                            # Clean up NULL strings if GPT returned them inside JSON
                            for k in ["description", "benefit", "how_to_apply"]:
                                if str(merged[k]).upper() == "NULL":
                                    merged[k] = scheme[k]
                            
                            merged["_source"] = "pdf"
                            enriched.append(merged)
                            continue
                        except Exception as parse_e:
                            print(f"JSON Parse fail for {scheme['name']}: {parse_e}")
            except Exception as e:
                print(f"RAG enrichment failed for {scheme['name']}: {e}")
            # Fallback: use hardcoded data
            s = dict(scheme)
            s["_source"] = "hardcoded"
            enriched.append(s)
        matched = enriched

    # ── Translation (single gpt-5.4-nano batch call) ─────────────────────────────
    if language == "English" or not llm:
        return matched

    import json as _json
    to_translate = [
        {
            "id": s["id"],
            "name": s["name"],
            "description": s["description"],
            "benefit": s["benefit"],
            "how_to_apply": s["how_to_apply"],
            "category": s["category"],
        }
        for s in matched
    ]

    prompt = (
        f"You are a helpful assistant. Translate the following JSON array of Indian government scheme details "
        f"into {language}. Keep all field names (keys) in English. Keep scheme IDs, URLs, numbers, and ₹ amounts "
        f"unchanged. Keep the category in English too. Translate only the text values for: "
        f"'name' (translated name in brackets after English name), 'description', 'benefit', 'how_to_apply'. "
        f"Return ONLY valid JSON array, no markdown, no extra text.\n\n"
        f"{_json.dumps(to_translate, ensure_ascii=False)}"
    )

    try:
        response = llm.invoke(prompt)
        raw = response.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        translated_list = _json.loads(raw)
        translated_map = {t["id"]: t for t in translated_list}

        result = []
        for scheme in matched:
            merged = dict(scheme)
            t = translated_map.get(scheme["id"])
            if t:
                merged["name"] = t.get("name", scheme["name"])
                merged["description"] = t.get("description", scheme["description"])
                merged["benefit"] = t.get("benefit", scheme["benefit"])
                merged["how_to_apply"] = t.get("how_to_apply", scheme["how_to_apply"])
                merged["category"] = t.get("category", scheme["category"])
            result.append(merged)
        return result

    except Exception as e:
        print(f"Translation error: {e}. Returning English schemes.")
        return matched



# ---------------------------------------------------------------------------
# WhatsApp recommendation keywords — all 10 languages
# ---------------------------------------------------------------------------

RECOMMEND_KEYWORDS = [
    # English
    "recommend", "suggest", "find scheme", "which scheme", "eligible scheme",
    "show scheme", "get scheme", "my scheme", "scheme for me",
    # Hindi
    "योजना", "सुझाव", "कौन सी योजना", "मेरी योजना", "पात्र", "सुझाएं",
    # Tamil
    "திட்டம்", "பரிந்துரை", "தகுதி", "திட்டங்கள்",
    # Telugu
    "పథకం", "సూచన", "అర్హత", "పథకాలు",
    # Bengali
    "যোজনা", "পরামর্শ", "যোগ্য", "প্রকল্প",
    # Marathi
    "योजना सुचवा", "पात्र योजना", "माझी योजना",
    # Kannada
    "ಯೋಜನೆ", "ಸಲಹೆ", "ಅರ್ಹ", "ಯೋಜನೆಗಳು",
    # Gujarati
    "યોજના", "સૂચન", "પાત્ર", "યોજનાઓ",
    # Punjabi
    "ਯੋਜਨਾ", "ਸੁਝਾਅ", "ਯੋਗ", "ਸਕੀਮ",
    # Malayalam
    "പദ്ധതി", "നിർദ്ദേശം", "യോഗ്യ", "പദ്ധതികൾ",
]


def is_recommendation_request(text: str) -> bool:
    """Check if user's message is asking for scheme recommendations."""
    text_lower = text.lower()
    return any(kw.lower() in text_lower for kw in RECOMMEND_KEYWORDS)


def format_whatsapp_recommendation(schemes: list[dict], language: str) -> str:
    """Format matched schemes into a WhatsApp-friendly message."""
    if not schemes:
        no_match_msgs = {
            "English": "I couldn't find schemes matching your profile. Please try with different details or ask me a specific question!",
            "Hindi": "आपकी जानकारी से मेल खाती कोई योजना नहीं मिली। कृपया अलग जानकारी के साथ प्रयास करें या सीधे प्रश्न पूछें!",
            "Tamil": "உங்கள் தகவலுடன் பொருந்தும் திட்டங்கள் எதுவும் கிடைக்கவில்லை. வேறு தகவலுடன் முயற்சிக்கவும்!",
            "Telugu": "మీ వివరాలకు సరిపోయే పథకాలు కనుగొనలేదు. వేరే వివరాలతో ప్రయత్నించండి!",
            "Bengali": "আপনার তথ্যের সাথে মিলে এমন কোনো প্রকল্প পাওয়া যায়নি। ভিন্ন তথ্য দিয়ে চেষ্টা করুন!",
            "Marathi": "तुमच्या माहितीशी जुळणाऱ्या योजना सापडल्या नाहीत. वेगळी माहिती देऊन पुन्हा प्रयत्न करा!",
            "Kannada": "ನಿಮ್ಮ ಮಾಹಿತಿಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಯೋಜನೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಬೇರೆ ಮಾಹಿತಿ ನೀಡಿ ಪ್ರಯತ್ನಿಸಿ!",
            "Gujarati": "તમારી માહિતી સાથે મળતી આવતી કોઈ યોજના ન મળી. જુદી માહિતી સાથે પ્રયાસ કરો!",
            "Punjabi": "ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਨਾਲ ਮੇਲ ਖਾਂਦੀ ਕੋਈ ਯੋਜਨਾ ਨਹੀਂ ਮਿਲੀ। ਵੱਖਰੀ ਜਾਣਕਾਰੀ ਨਾਲ ਕੋਸ਼ਿਸ਼ ਕਰੋ!",
            "Malayalam": "നിങ്ങളുടെ വിവരങ്ങൾക്ക് അനുയോജ്യമായ പദ്ധതികൾ കണ്ടെത്തിയില്ല. വ്യത്യസ്ത വിവരങ്ങൾ ഉപയോഗിച്ച് ശ്രമിക്കുക!",
        }
        return no_match_msgs.get(language, no_match_msgs["English"])

    headers = {
        "English": "🎯 *Schemes matched for you:*\n\n",
        "Hindi": "🎯 *आपके लिए योजनाएं:*\n\n",
        "Tamil": "🎯 *உங்களுக்கான திட்டங்கள்:*\n\n",
        "Telugu": "🎯 *మీకు సరిపోయే పథకాలు:*\n\n",
        "Bengali": "🎯 *আপনার জন্য প্রকল্পগুলি:*\n\n",
        "Marathi": "🎯 *तुमच्यासाठी योजना:*\n\n",
        "Kannada": "🎯 *ನಿಮಗಾಗಿ ಯೋಜನೆಗಳು:*\n\n",
        "Gujarati": "🎯 *તમારા માટે યોજનાઓ:*\n\n",
        "Punjabi": "🎯 *ਤੁਹਾਡੇ ਲਈ ਯੋਜਨਾਵਾਂ:*\n\n",
        "Malayalam": "🎯 *നിങ്ങൾക്കായുള്ള പദ്ധതികൾ:*\n\n",
    }

    footers = {
        "English": "\n\n💬 Type any scheme name for full details!",
        "Hindi": "\n\n💬 पूरी जानकारी के लिए कोई भी योजना का नाम लिखें!",
        "Tamil": "\n\n💬 முழு விவரங்களுக்கு எந்த திட்டத்தின் பெயரையும் தட்டச்சு செய்யவும்!",
        "Telugu": "\n\n💬 పూర్తి వివరాలకు ఏదైనా పథకం పేరు టైప్ చేయండి!",
        "Bengali": "\n\n💬 সম্পূর্ণ তথ্যের জন্য যেকোনো প্রকল্পের নাম টাইপ করুন!",
        "Marathi": "\n\n💬 पूर्ण माहितीसाठी कोणत्याही योजनेचे नाव टाइप करा!",
        "Kannada": "\n\n💬 ಸಂಪೂರ್ಣ ವಿವರಗಳಿಗಾಗಿ ಯಾವುದೇ ಯೋಜನೆಯ ಹೆಸರನ್ನು ಟೈಪ್ ಮಾಡಿ!",
        "Gujarati": "\n\n💬 સંપૂર્ણ વિગતો માટે કોઈ પણ યોજનાનું નામ ટાઇપ કરો!",
        "Punjabi": "\n\n💬 ਪੂਰੀ ਜਾਣਕਾਰੀ ਲਈ ਕਿਸੇ ਵੀ ਯੋਜਨਾ ਦਾ ਨਾਂ ਟਾਈਪ ਕਰੋ!",
        "Malayalam": "\n\n💬 പൂർണ്ണ വിവരങ്ങൾക്ക് ഏതെങ്കിലും പദ്ധതിയുടെ പേര് ടൈപ്പ് ചെയ്യുക!",
    }

    lines = [headers.get(language, headers["English"])]
    for i, scheme in enumerate(schemes[:7], 1):  # max 7 for WhatsApp
        lines.append(f"{i}. {scheme['icon']} *{scheme['name']}* — {scheme['benefit']}")

    lines.append(footers.get(language, footers["English"]))
    return "".join(lines)


def format_voice_recommendation(schemes: list[dict], language: str) -> str:
    """Format matched schemes for voice (short, speakable sentence)."""
    if not schemes:
        msgs = {
            "English": "I could not find any schemes matching your details. Please tell me your occupation and income and I will try again.",
            "Hindi": "आपकी जानकारी से कोई योजना नहीं मिली। कृपया अपना पेशा और आय बताएं, मैं फिर प्रयास करूंगा।",
        }
        return msgs.get(language, msgs["English"])

    top = schemes[:3]
    intros = {
        "English": f"I found {len(top)} schemes for you. ",
        "Hindi": f"आपके लिए {len(top)} योजनाएं मिली हैं। ",
        "Tamil": f"உங்களுக்கு {len(top)} திட்டங்கள் கிடைத்தன. ",
        "Telugu": f"మీకు {len(top)} పథకాలు దొరికాయి. ",
    }
    intro = intros.get(language, intros["English"])
    parts = [f"{s['name']}, with benefit: {s['benefit']}" for s in top]
    return intro + ". ".join(parts) + ". For more details, please visit our website or type your scheme name on WhatsApp."


def verify_scheme_message(text: str, language: str = "English", llm=None, vector_db=None) -> dict:
    """
    Verifies a suspicious scheme message against the official document database.
    
    Returns:
    {
        "verdict": "Authentic" | "Suspicious" | "Fake",
        "confidence": float (0-1),
        "reasoning": str (translated),
        "official_details": str (optional)
    }
    """
    if not llm:
        return {"verdict": "Suspicious", "confidence": 0.5, "reasoning": "Verification engine offline."}

    # 1. Ask LLM to extract the scheme being mentioned and the core claim
    extract_prompt = (
        f"You are a fact-checker. Extract the name of the government scheme and the primary claim "
        f"(e.g. '₹10,000 subsidy') from this message:\n\n\"{text}\"\n\n"
        f"Return ONLY a JSON with keys 'scheme_name' and 'claim'. If no scheme is found, return NULL."
    )
    
    try:
        resp = llm.invoke(extract_prompt)
        raw = resp.content.strip()
        if "NULL" in raw.upper():
            return {
                "verdict": "Suspicious",
                "confidence": 0.3,
                "reasoning": "Could not identify a specific government scheme in this message."
            }
        
        # Clean JSON
        import re as _re
        import json as _json
        match = _re.search(r'\{.*\}', raw, _re.DOTALL)
        info = _json.loads(match.group(0)) if match else {}
        
        scheme_name = info.get("scheme_name", "")
        claim = info.get("claim", "")

        # 2. Search PDF database for this scheme
        search_query = f"Official details and benefits of {scheme_name} government scheme India"
        docs = vector_db.similarity_search(search_query, k=4) if vector_db else []
        context = "\n\n".join(d.page_content for d in docs) if docs else "No official documents found in database."

        # 3. Final Verification Prompt
        verify_prompt = (
            f"You are an official Government Fact-Checker. Compare the following CLAIM with the OFFICIAL DATA.\n\n"
            f"MESSAGE TEXT: \"{text}\"\n"
            f"CLAIM TO VERIFY: \"{claim}\"\n\n"
            f"OFFICIAL DATA FROM PDFs:\n{context}\n\n"
            f"VERDICT RULES:\n"
            f"- 'Authentic': If the claim closely matches official benefits.\n"
            f"- 'Suspicious': If the scheme exists but the benefits/details are exaggerated or slightly wrong.\n"
            f"- 'Fake': If the scheme does not exist at all or the claim is a known scam pattern (e.g. asking for OTP, payment to register).\n\n"
            f"Respond in {language}. Provide a JSON object with:\n"
            f"- verdict: One word (Authentic/Suspicious/Fake)\n"
            f"- confidence: Score between 0 and 1\n"
            f"- reasoning: 1-2 sentences explaining why\n"
            f"- official_details: The actual official benefit for this scheme if found."
        )

        resp = llm.invoke(verify_prompt)
        raw_final = resp.content.strip()
        match_final = _re.search(r'\{.*\}', raw_final, _re.DOTALL)
        return _json.loads(match_final.group(0)) if match_final else {"verdict": "Suspicious", "reasoning": "Failed to parse verification result."}

    except Exception as e:
        print(f"Verification error: {e}")
        return {"verdict": "Suspicious", "confidence": 0.5, "reasoning": f"Error during verification: {str(e)}"}

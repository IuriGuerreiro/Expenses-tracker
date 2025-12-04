import json
import time
import uuid
import random

# Configuration
OUTPUT_FILE = "docs/diagrams/wireframe-expensestracker.excalidraw"
THEME = {
    "bg": "#ffffff",
    "container": "#f5f5f5",
    "stroke": "#212121",
    "text": "#000000",
    "brand": "#4f46e5",  # Indigo
    "success": "#10b981", # Green
    "danger": "#f43f5e",  # Red
    "warning": "#f59e0b"  # Amber
}

SIDEBAR_WIDTH = 280

elements = []
font_family = 1 # 1: Sans, 2: Code, 3: Hand

def get_id():
    return str(uuid.uuid4())[:8]

def create_element(type, x, y, w, h, **kwargs):
    el = {
        "type": type,
        "version": 1,
        "versionNonce": random.randint(0, 100000),
        "isDeleted": False,
        "id": get_id(),
        "fillStyle": "solid",
        "strokeWidth": 1,
        "strokeStyle": "solid",
        "roughness": 0, # High fidelity, cleaner lines
        "opacity": 100,
        "angle": 0,
        "x": x,
        "y": y,
        "width": w,
        "height": h,
        "strokeColor": THEME["stroke"],
        "backgroundColor": "transparent",
        "groupIds": [],
        "roundness": None,
        "seed": random.randint(0, 100000),
        "boundElements": [],
        "updated": int(time.time() * 1000),
        "link": None,
        "locked": False,
    }
    el.update(kwargs)
    return el

def create_rect(x, y, w, h, fill=None, stroke=None, roundness=None, groupIds=[], **kwargs):
    return create_element("rectangle", x, y, w, h, 
                          backgroundColor=fill if fill else "transparent",
                          strokeColor=stroke if stroke else THEME["stroke"],
                          roundness={"type": 3} if roundness else None,
                          groupIds=groupIds,
                          **kwargs)

def create_text(x, y, text, size=20, align="left", color=None, width=None, groupIds=[]):
    # Estimate width if not provided (rough calc)
    w = width if width else len(text) * size * 0.6
    h = size * 1.2
    return create_element("text", x, y, w, h,
                          text=text,
                          fontSize=size,
                          fontFamily=font_family,
                          textAlign=align,
                          verticalAlign="top",
                          strokeColor=color if color else THEME["text"],
                          groupIds=groupIds)

def create_ellipse(x, y, w, h, fill=None, stroke=None, groupIds=[], **kwargs):
    return create_element("ellipse", x, y, w, h,
                          backgroundColor=fill if fill else "transparent",
                          strokeColor=stroke if stroke else THEME["stroke"],
                          groupIds=groupIds,
                          **kwargs)

def create_line(x, y, w, h, points, groupIds=[], **kwargs):
    return create_element("line", x, y, w, h, points=points, groupIds=groupIds, **kwargs)


# --- Builders ---

def build_screen_frame(x, y, title):
    # Browser chrome
    elements.append(create_rect(x, y, 1440, 900, fill="#ffffff"))
    # Header bar
    elements.append(create_rect(x, y, 1440, 60, fill="#f3f4f6", stroke="transparent"))
    # Window controls
    elements.append(create_ellipse(x+20, y+20, 12, 12, fill="#ff5f56", stroke="transparent"))
    elements.append(create_ellipse(x+40, y+20, 12, 12, fill="#ffbd2e", stroke="transparent"))
    elements.append(create_ellipse(x+60, y+20, 12, 12, fill="#27c93f", stroke="transparent"))
    # URL Bar
    elements.append(create_rect(x+100, y+10, 1200, 40, fill="#ffffff", roundness=True))
    elements.append(create_text(x+120, y+20, f"https://expensestracker.app/{title.lower()}", size=16, color="#9ca3af"))

def build_nav(x, y):
    # App Header inside page (now a sidebar)
    sidebar_x = x
    sidebar_y = y + 60
    elements.append(create_rect(sidebar_x, sidebar_y, SIDEBAR_WIDTH, 840, fill="#ffffff", stroke="#e5e7eb")) # Height 900-60
    
    # Logo
    elements.append(create_text(sidebar_x+40, sidebar_y+30, "ExpensesTracker", size=24, color=THEME["brand"]))
    
    # Navigation Links
    links = [
        {"name": "Dashboard", "icon": "🏠", "route": "dashboard"},
        {"name": "Transactions", "icon": "💸", "route": "transactions"},
        {"name": "Accounts", "icon": "💳", "route": "accounts"},
        {"name": "Categories", "icon": "🏷️", "route": "categories"},
        {"name": "Visualizations", "icon": "📊", "route": "visualizations"},
        {"name": "Settings", "icon": "⚙️", "route": "settings"}
    ]
    
    link_y = sidebar_y + 120
    for link in links:
        color = THEME["brand"] if link["name"] == "Dashboard" else "#4b5563"
        elements.append(create_text(sidebar_x+40, link_y, f"{link['icon']} {link['name']}", size=18, color=color))
        link_y += 60
    
    # Profile placeholder at bottom
    elements.append(create_ellipse(sidebar_x+40, sidebar_y+750, 40, 40, fill="#d1d5db"))
    elements.append(create_text(sidebar_x+90, sidebar_y+760, "A. User", size=16, color="#4b5563"))

def build_login(start_x, start_y):
    build_screen_frame(start_x, start_y, "login")
    
    # Center Card
    cx = start_x + 520
    cy = start_y + 250
    elements.append(create_rect(cx, cy, 400, 400, fill="#ffffff", roundness=True))
    
    elements.append(create_text(cx+130, cy+40, "Welcome Back", size=24))
    
    # Email
    elements.append(create_text(cx+40, cy+100, "Email", size=14, color="#6b7280"))
    elements.append(create_rect(cx+40, cy+125, 320, 40, fill="#ffffff", stroke="#d1d5db", roundness=True))
    
    # Password
    elements.append(create_text(cx+40, cy+180, "Password", size=14, color="#6b7280"))
    elements.append(create_rect(cx+40, cy+205, 320, 40, fill="#ffffff", stroke="#d1d5db", roundness=True))
    
    # Button
    elements.append(create_rect(cx+40, cy+280, 320, 50, fill=THEME["brand"], stroke="transparent", roundness=True))
    elements.append(create_text(cx+160, cy+295, "Sign In", size=16, color="#ffffff"))
    
    # Links
    elements.append(create_text(cx+120, cy+350, "Don't have an account? Sign up", size=12, color=THEME["brand"]))


def build_dashboard(start_x, start_y):
    build_screen_frame(start_x, start_y, "dashboard")
    build_nav(start_x, start_y)
    
    content_x_offset = SIDEBAR_WIDTH + 40 # Sidebar width + padding
    content_y = start_y + 100 # Adjusted for removed top navbar
    
    # Hero Section
    elements.append(create_text(start_x+content_x_offset, content_y, "Dashboard", size=32))
    
    # Safe to Spend Card
    hx = start_x + content_x_offset
    hy = content_y + 60
    elements.append(create_rect(hx, hy, 400, 180, fill=THEME["brand"], stroke="transparent", roundness=True))
    elements.append(create_text(hx+30, hy+30, "Safe to Spend", size=16, color="#e0e7ff"))
    elements.append(create_text(hx+30, hy+70, "$1,250.00", size=48, color="#ffffff"))
    elements.append(create_text(hx+30, hy+130, "Available across Spending Accounts", size=14, color="#e0e7ff"))
    
    # Summary Cards
    sx = hx + 440
    elements.append(create_rect(sx, hy, 280, 180, fill="#ffffff", stroke="#e5e7eb", roundness=True))
    elements.append(create_text(sx+30, hy+30, "Income (Month)", size=14, color="#6b7280"))
    elements.append(create_text(sx+30, hy+60, "$4,500.00", size=28, color=THEME["success"]))
    
    sx += 300
    elements.append(create_rect(sx, hy, 280, 180, fill="#ffffff", stroke="#e5e7eb", roundness=True))
    elements.append(create_text(sx+30, hy+30, "Spent (Month)", size=14, color="#6b7280"))
    elements.append(create_text(sx+30, hy+60, "$2,150.00", size=28, color=THEME["danger"]))

    # Accounts Grid
    cy = hy + 220
    elements.append(create_text(start_x+content_x_offset, cy, "Your Accounts", size=24))
    
    accounts = [
        {"name": "Daily Spending", "bal": "$320.00", "pct": 60, "color": THEME["success"]},
        {"name": "Bills Account", "bal": "$1,100.00", "pct": 90, "color": THEME["success"]},
        {"name": "Savings", "bal": "$5,000.00", "pct": 100, "color": THEME["success"]},
        {"name": "Emergency Fund", "bal": "$2,000.00", "pct": 100, "color": THEME["success"]},
        {"name": "Travel Fund", "bal": "$450.00", "pct": 30, "color": THEME["warning"]},
        {"name": "Tech Upgrade", "bal": "$1,200.00", "pct": 80, "color": THEME["success"]},
    ]
    
    grid_x_start = start_x + content_x_offset
    grid_y = cy + 50
    col = 0
    
    for acc in accounts:
        if col > 2: # 3 columns
            col = 0
            grid_y += 180
        
        cx = grid_x_start + (col * 440)
        
        # Card
        elements.append(create_rect(cx, grid_y, 400, 150, fill="#ffffff", stroke="#e5e7eb", roundness=True))
        # Name
        elements.append(create_text(cx+20, grid_y+20, acc["name"], size=18))
        # Balance
        elements.append(create_text(cx+20, grid_y+50, acc["bal"], size=32))
        # Progress Bar BG
        elements.append(create_rect(cx+20, grid_y+110, 360, 10, fill="#f3f4f6", stroke="transparent", roundness=True))
        # Progress Bar Fill
        fill_w = 360 * (acc["pct"] / 100)
        if fill_w > 0:
            elements.append(create_rect(cx+20, grid_y+110, fill_w, 10, fill=acc["color"], stroke="transparent", roundness=True))
            
        col += 1

    # Floating Action Buttons (Simulated at bottom right, adjusted for sidebar)
    fab_x = start_x + 1300
    fab_y = start_y + 800
    
    # Add Expense (Red)
    elements.append(create_ellipse(fab_x, fab_y, 60, 60, fill=THEME["danger"], stroke="transparent"))
    elements.append(create_text(fab_x+18, fab_y+10, "-", size=40, color="#ffffff"))
    
    # Add Income (Green)
    elements.append(create_ellipse(fab_x, fab_y-80, 60, 60, fill=THEME["success"], stroke="transparent"))
    elements.append(create_text(fab_x+15, fab_y-90, "+", size=40, color="#ffffff"))


def build_add_expense(start_x, start_y):
    # Background (Blurred/Dimmed Dashboard)
    build_dashboard(start_x, start_y) # This will now build with sidebar
    # Overlay (adjusted to start after sidebar)
    elements.append(create_rect(start_x + SIDEBAR_WIDTH, start_y + 60, 1440 - SIDEBAR_WIDTH, 840, fill="#000000", stroke="transparent", opacity=50))
    
    # Modal (Larger height for extra field)
    modal_width = 500
    modal_height = 700
    
    mx = start_x + SIDEBAR_WIDTH + ((1440 - SIDEBAR_WIDTH) - modal_width) / 2
    my = start_y + 60 + (840 - modal_height) / 2
    
    elements.append(create_rect(mx, my, modal_width, modal_height, fill="#ffffff", roundness=True))
    
    elements.append(create_text(mx+40, my+40, "Log Expense", size=24))
    
    # Amount
    elements.append(create_text(mx+40, my+90, "Amount", size=14, color="#6b7280"))
    elements.append(create_rect(mx+40, my+115, 420, 60, fill="#ffffff", stroke="#d1d5db", roundness=True))
    elements.append(create_text(mx+60, my+130, "$ 45.00", size=32))
    
    # Payment Account (Source)
    elements.append(create_text(mx+40, my+200, "Payment Account", size=14, color="#6b7280"))
    elements.append(create_rect(mx+40, my+225, 420, 50, fill="#ffffff", stroke="#d1d5db", roundness=True))
    elements.append(create_text(mx+60, my+240, "Daily Spending", size=16))
    elements.append(create_text(mx+300, my+240, "Avail: $320.00", size=14, color=THEME["success"])) 
    
    # Expense Category (Classification)
    elements.append(create_text(mx+40, my+300, "Expense Category", size=14, color="#6b7280"))
    elements.append(create_rect(mx+40, my+325, 420, 50, fill="#ffffff", stroke="#d1d5db", roundness=True))
    elements.append(create_text(mx+60, my+340, "Dining Out", size=16))
    
    # Description
    elements.append(create_text(mx+40, my+400, "Description", size=14, color="#6b7280"))
    elements.append(create_rect(mx+40, my+425, 420, 50, fill="#ffffff", stroke="#d1d5db", roundness=True))
    elements.append(create_text(mx+60, my+440, "Lunch with team", size=16))
    
    # Date
    elements.append(create_text(mx+40, my+500, "Date", size=14, color="#6b7280"))
    elements.append(create_rect(mx+40, my+525, 420, 50, fill="#ffffff", stroke="#d1d5db", roundness=True))
    elements.append(create_text(mx+60, my+540, "Today, Dec 4", size=16))
    
    # Buttons
    elements.append(create_rect(mx+40, my+620, 200, 50, fill="#ffffff", stroke="#d1d5db", roundness=True))
    elements.append(create_text(mx+110, my+635, "Cancel", size=16))
    
    elements.append(create_rect(mx+260, my+620, 200, 50, fill=THEME["danger"], stroke="transparent", roundness=True))
    elements.append(create_text(mx+330, my+635, "Save Expense", size=16, color="#ffffff"))


def build_history(start_x, start_y):
    build_screen_frame(start_x, start_y, "transactions")
    build_nav(start_x, start_y)
    
    content_x_offset = SIDEBAR_WIDTH + 40
    content_y = start_y + 100
    
    elements.append(create_text(start_x+content_x_offset, content_y, "Recent Transactions", size=32))
    
    # Filters
    fy = content_y + 60
    elements.append(create_rect(start_x+content_x_offset, fy, 200, 40, fill="#ffffff", stroke="#d1d5db", roundness=True))
    elements.append(create_text(start_x+content_x_offset+20, fy+10, "This Month", size=14))
    
    elements.append(create_rect(start_x+content_x_offset+220, fy, 200, 40, fill="#ffffff", stroke="#d1d5db", roundness=True))
    elements.append(create_text(start_x+content_x_offset+240, fy+10, "All Accounts", size=14))
    
    # Table Header
    ty = fy + 60
    elements.append(create_text(start_x+content_x_offset, ty, "Date", size=14, color="#6b7280"))
    elements.append(create_text(start_x+content_x_offset+150, ty, "Description", size=14, color="#6b7280"))
    elements.append(create_text(start_x+content_x_offset+500, ty, "Category", size=14, color="#6b7280"))
    elements.append(create_text(start_x+content_x_offset+800, ty, "Account", size=14, color="#6b7280"))
    elements.append(create_text(start_x+content_x_offset+1050, ty, "Amount", size=14, color="#6b7280"))
    elements.append(create_line(start_x+content_x_offset, ty+30, 1440 - SIDEBAR_WIDTH - 80, 0, [[0,0], [1440 - SIDEBAR_WIDTH - 80,0]])) 
    
    # Rows
    rows = [
        ("Dec 4", "Lunch with team", "Dining Out", "Daily Spending", "- $45.00", THEME["danger"]),
        ("Dec 3", "Weekly Groceries", "Groceries", "Daily Spending", "- $120.50", THEME["danger"]),
        ("Dec 1", "Paycheck", "Salary", "Savings", "+ $2,250.00", THEME["success"]),
        ("Nov 28", "Netflix", "Entertainment", "Daily Spending", "- $15.00", THEME["danger"]),
        ("Nov 25", "Electric Bill", "Utilities", "Bills Account", "- $85.00", THEME["danger"]),
    ]
    
    ry = ty + 50
    for date, desc, cat, acc, amt, color in rows:
        elements.append(create_rect(start_x+content_x_offset, ry-15, 1440 - SIDEBAR_WIDTH - 80, 60, fill="#ffffff", stroke="transparent")) 
        elements.append(create_text(start_x+content_x_offset, ry, date, size=16))
        elements.append(create_text(start_x+content_x_offset+150, ry, desc, size=16))
        
        # Category badge
        elements.append(create_rect(start_x+content_x_offset+500, ry-5, 180, 30, fill="#f3f4f6", stroke="transparent", roundness=True))
        elements.append(create_text(start_x+content_x_offset+515, ry, cat, size=14))
        
        # Account text
        elements.append(create_text(start_x+content_x_offset+800, ry, acc, size=14))
        
        elements.append(create_text(start_x+content_x_offset+1050, ry, amt, size=16, color=color))
        
        elements.append(create_line(start_x+content_x_offset, ry+45, 1440 - SIDEBAR_WIDTH - 80, 0, [[0,0], [1440 - SIDEBAR_WIDTH - 80,0]], strokeColor="#f3f4f6"))
        ry += 60

def build_viz(start_x, start_y):
    build_screen_frame(start_x, start_y, "visualizations")
    build_nav(start_x, start_y)
    
    content_x_offset = SIDEBAR_WIDTH + 40
    content_y = start_y + 100
    
    elements.append(create_text(start_x+content_x_offset, content_y, "Financial Insights", size=32))
    
    # Pie Chart Section
    py = content_y + 80
    elements.append(create_rect(start_x+content_x_offset, py, 480, 500, fill="#ffffff", stroke="#e5e7eb", roundness=True)) # Adjusted width
    elements.append(create_text(start_x+content_x_offset+30, py+30, "Spending by Category", size=20))
    
    # Simulating Pie Chart
    cx, cy = start_x+content_x_offset+240, py+280
    elements.append(create_ellipse(cx-150, cy-150, 300, 300, fill="#transparent", stroke="#e5e7eb"))
    
    # Slices (Simulated with arcs/lines or just colors)
    # Since excalidraw JSON arcs are complex, we'll use a simpler representation
    # Slice 1
    elements.append(create_ellipse(cx-150, cy-150, 300, 300, stroke=THEME["brand"])) # Outline
    elements.append(create_line(cx, cy, 0, -150, [[0,0], [0,-150]]))
    elements.append(create_line(cx, cy, 130, 75, [[0,0], [130,75]]))
    elements.append(create_line(cx, cy, -130, 75, [[0,0], [-130,75]]))
    
    elements.append(create_text(cx+80, cy-80, "Groceries\n40%", size=14))
    elements.append(create_text(cx-100, cy+80, "Rent\n35%", size=14))
    elements.append(create_text(cx-100, cy-80, "Others\n25%", size=14))
    
    # Bar Chart Section (Adjusted position and width)
    bx = start_x + content_x_offset + 520 # Adjusted x
    elements.append(create_rect(bx, py, 480, 500, fill="#ffffff", stroke="#e5e7eb", roundness=True)) # Adjusted width
    elements.append(create_text(bx+30, py+30, "Income vs Expenses (6 Months)", size=20))
    
    # Bars
    bar_x = bx + 40
    bar_base = py + 400
    
    months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    for i, m in enumerate(months):
        # Income Bar
        h_inc = random.randint(100, 200) # Smaller bars due to smaller chart width
        elements.append(create_rect(bar_x, bar_base-h_inc, 20, h_inc, fill=THEME["success"], stroke="transparent")) # Smaller bar width
        
        # Expense Bar
        h_exp = random.randint(80, 150) # Smaller bars
        elements.append(create_rect(bar_x+25, bar_base-h_exp, 20, h_exp, fill=THEME["danger"], stroke="transparent")) # Smaller bar width
        
        elements.append(create_text(bar_x+10, bar_base+10, m, size=12)) # Smaller text
        
        bar_x += 70 # Smaller spacing

def build_create_account(start_x, start_y):
    # Background (Blurred/Dimmed Dashboard)
    build_dashboard(start_x, start_y) 
    # Overlay
    elements.append(create_rect(start_x + SIDEBAR_WIDTH, start_y + 60, 1440 - SIDEBAR_WIDTH, 840, fill="#000000", stroke="transparent", opacity=50))
    
    # Modal
    modal_width = 500
    modal_height = 500
    
    mx = start_x + SIDEBAR_WIDTH + ((1440 - SIDEBAR_WIDTH) - modal_width) / 2
    my = start_y + 60 + (840 - modal_height) / 2
    
    elements.append(create_rect(mx, my, modal_width, modal_height, fill="#ffffff", roundness=True))
    
    elements.append(create_text(mx+40, my+40, "Create New Account", size=24))
    
    # Account Name
    elements.append(create_text(mx+40, my+100, "Account Name", size=14, color="#6b7280"))
    elements.append(create_rect(mx+40, my+125, 420, 50, fill="#ffffff", stroke="#d1d5db", roundness=True))
    elements.append(create_text(mx+60, my+140, "e.g. Holiday Fund", size=16, color="#9ca3af"))
    
    # Allocation Percentage
    elements.append(create_text(mx+40, my+200, "Income Allocation %", size=14, color="#6b7280"))
    elements.append(create_rect(mx+40, my+225, 420, 50, fill="#ffffff", stroke="#d1d5db", roundness=True))
    elements.append(create_text(mx+60, my+240, "10", size=16))
    elements.append(create_text(mx+380, my+240, "%", size=16, color="#6b7280"))
    
    # Initial Balance (Optional)
    elements.append(create_text(mx+40, my+300, "Initial Balance (Optional)", size=14, color="#6b7280"))
    elements.append(create_rect(mx+40, my+325, 420, 50, fill="#ffffff", stroke="#d1d5db", roundness=True))
    elements.append(create_text(mx+60, my+340, "$ 0.00", size=16))
    
    # Buttons
    elements.append(create_rect(mx+40, my+410, 200, 50, fill="#ffffff", stroke="#d1d5db", roundness=True))
    elements.append(create_text(mx+110, my+425, "Cancel", size=16))
    
    elements.append(create_rect(mx+260, my+410, 200, 50, fill=THEME["brand"], stroke="transparent", roundness=True))
    elements.append(create_text(mx+330, my+425, "Create Account", size=16, color="#ffffff"))

# --- Main Execution ---

# Grid Layout
# 0,0: Login
# 1600,0: Dashboard
# 3200,0: Add Expense (Modal view)
# 1600, 1100: History
# 3200, 1100: Create Account (Modal view)
# 4800, 0: Viz

build_login(0, 0)
build_dashboard(1600, 0)
build_add_expense(3200, 0)
build_history(1600, 1100)
build_create_account(3200, 1100)
build_viz(4800, 0)


# Output
data = {
    "type": "excalidraw",
    "version": 2,
    "source": "https://excalidraw.com",
    "elements": elements,
    "appState": {
        "gridSize": 20,
        "viewBackgroundColor": "#f0f0f0"
    },
    "files": {}
}

with open(OUTPUT_FILE, "w") as f:
    json.dump(data, f, indent=2)

print(f"Generated {len(elements)} elements to {OUTPUT_FILE}")

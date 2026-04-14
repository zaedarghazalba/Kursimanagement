# 🎨 Professional Color Scheme Guide

## Color Palette Overview

Aplikasi ini menggunakan color palette profesional yang konsisten untuk memberikan pengalaman pengguna yang optimal.

---

## 📋 Primary Colors

### **Indigo/Blue (Primary Action)**
- **Usage**: Primary buttons, active navigation, links, highlights
- **Hex Codes**:
  - `#6366f1` (indigo-500) - Main accent
  - `#4f46e5` (indigo-600) - Primary action
  - `#4338ca` (indigo-700) - Hover states
- **Tailwind**: `bg-indigo-600`, `text-indigo-600`, `border-indigo-200`

### **Slate (Neutral/Text)**
- **Usage**: Text, borders, backgrounds, secondary elements
- **Hex Codes**:
  - `#0f172a` (slate-900) - Primary text
  - `#475569` (slate-600) - Secondary text
  - `#e2e8f0` (slate-200) - Borders
  - `#f8fafc` (slate-50) - Light backgrounds
- **Tailwind**: `text-slate-800`, `border-slate-200`, `bg-slate-50`

---

## 🟢 Status Colors

### **Emerald (Success)**
- **Usage**: Success messages, generate buttons, confirmation
- **Hex Codes**:
  - `#10b981` (emerald-500) - Success indicator
  - `#059669` (emerald-600) - Primary success
- **Tailwind**: `bg-emerald-50`, `text-emerald-600`, `border-emerald-200`

### **Amber (Warning)**
- **Usage**: Warning messages, incomplete steps, conflicts
- **Hex Codes**:
  - `#f59e0b` (amber-500) - Warning indicator
  - `#d97706` (amber-600) - Primary warning
- **Tailwind**: `bg-amber-50`, `text-amber-600`, `border-amber-200`

### **Rose (Error/Danger)**
- **Usage**: Error messages, delete buttons, critical alerts
- **Hex Codes**:
  - `#f43f5e` (rose-500) - Error indicator
  - `#e11d48` (rose-600) - Primary error
- **Tailwind**: `bg-rose-50`, `text-rose-600`, `border-rose-200`

### **Sky (Info)**
- **Usage**: Information messages, info badges
- **Hex Codes**:
  - `#0ea5e9` (sky-500) - Info indicator
  - `#0284c7` (sky-600) - Primary info
- **Tailwind**: `bg-sky-50`, `text-sky-600`, `border-sky-200`

---

## 🎯 Component-Specific Colors

### **Navigation Bar**
- Background: `bg-white`
- Border: `border-slate-200`
- Active: `bg-indigo-600 text-white`
- Inactive: `text-slate-600 hover:bg-slate-100`

### **Buttons**
- **Primary (Generate)**: `bg-emerald-600 hover:bg-emerald-700`
- **Secondary (Add)**: `bg-indigo-600 hover:bg-indigo-700`
- **Cancel**: `bg-slate-200 text-slate-700 hover:bg-slate-300`
- **Delete**: `text-rose-600 hover:bg-rose-50`
- **Edit**: `text-indigo-600 hover:bg-indigo-50`

### **Cards**
- Background: `bg-white`
- Border: `border-slate-200`
- Shadow: `shadow-sm hover:shadow-md`
- Header: `text-slate-800`

### **Tables**
- Header: `bg-slate-50 text-slate-700`
- Row: `border-slate-100 hover:bg-slate-50`
- Cell: `text-slate-600`
- Badge: `bg-indigo-50 text-indigo-700`

### **Forms**
- Input Border: `border-slate-300`
- Focus Ring: `focus:ring-indigo-500 focus:border-indigo-500`
- Label: `text-slate-700 font-semibold`

### **Status Messages**
- **Success**: `bg-emerald-50 text-emerald-800 border-emerald-200`
- **Error**: `bg-rose-50 text-rose-800 border-rose-200`
- **Warning**: `bg-amber-50 text-amber-800 border-amber-500` (left border)
- **Info**: `bg-sky-50 text-sky-800 border-sky-200`

### **Dashboard Cards**
- Icon Background: `bg-indigo-100`, `bg-emerald-100`, `bg-sky-100`, `bg-violet-100`
- Icon Color: `text-indigo-600`, `text-emerald-600`, `text-sky-600`, `text-violet-600`
- Number: `text-slate-800 text-3xl font-bold`
- Label: `text-slate-600 font-medium`

### **Seat Grid**
- Occupied: `bg-white border-indigo-300 hover:border-indigo-500`
- Empty: `bg-slate-50 border-slate-300 border-dashed`
- Class Badge: `bg-indigo-50 text-indigo-700`
- Drag Icon: `text-slate-400`

### **Room Tabs**
- Active: `bg-indigo-600 text-white shadow-sm`
- Inactive: `bg-white text-slate-700 border-slate-300 hover:bg-slate-50`

### **Conflict Warning**
- Background: `bg-amber-50`
- Border: `border-l-4 border-amber-500` (left border emphasis)
- Icon: `text-amber-600`
- Text: `text-amber-700`

---

## 🎨 Color Psychology

### **Why This Palette?**

1. **Indigo/Blue** - Trust, professionalism, stability
   - Perfect for educational management
   - Calming and authoritative

2. **Slate** - Modern, clean, sophisticated
   - Better than pure gray
   - Easy on the eyes

3. **Emerald** - Success, growth, positivity
   - Encouraging user actions
   - Clear success feedback

4. **Amber** - Caution, attention, warmth
   - Non-alarming warnings
   - Helpful guidance

5. **Rose** - Urgency, importance
   - Clear error indication
   - Professional danger

---

## 📐 Usage Guidelines

### **DO:**
- ✅ Use indigo-600 for primary actions
- ✅ Use slate colors for text and borders
- ✅ Use status colors consistently
- ✅ Maintain contrast ratios
- ✅ Use hover states for interactivity

### **DON'T:**
- ❌ Mix different blue/indigo shades randomly
- ❌ Use bright colors for backgrounds
- ❌ Ignore accessibility
- ❌ Create new color variants without reason
- ❌ Use gray where slate is specified

---

## 🌈 Accessibility

### **Contrast Ratios**
All text meets WCAG 2.1 AA standards:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### **Color Blindness**
- Success/Error distinguished by icon + color
- Status messages include text labels
- No critical information conveyed by color alone

---

## 🛠️ Implementation

### **Tailwind Configuration**
Colors are defined in `globals.css` using CSS custom properties:

```css
:root {
  --color-primary-500: #6366f1;
  --color-primary-600: #4f46e5;
  /* ... more colors */
}
```

### **Using Colors**

**In Components:**
```tsx
// Primary button
<button className="bg-indigo-600 hover:bg-indigo-700">

// Text
<h1 className="text-slate-800">

// Border
<div className="border-slate-200">

// Success message
<div className="bg-emerald-50 text-emerald-800">
```

**In CSS:**
```css
.my-element {
  background: var(--color-primary-600);
  color: var(--color-slate-800);
  border: 1px solid var(--color-slate-200);
}
```

---

## 📝 Summary

This professional color scheme provides:
- ✅ **Consistency** - Same colors used throughout
- ✅ **Clarity** - Clear visual hierarchy
- ✅ **Accessibility** - WCAG compliant
- ✅ **Professionalism** - Modern, clean design
- ✅ **Usability** - Intuitive user experience

---

**Last Updated**: 2026-04-14
**Version**: 1.0
**Design System**: Professional Education Theme

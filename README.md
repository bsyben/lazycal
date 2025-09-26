# LazyCal - Smart Task Management System

A web-based task management application designed for people who struggle with procrastination. LazyCal intelligently adjusts your daily workload based on your procrastination patterns and helps you stay on track with your goals.

## 📸 Screenshots

### Task List View
![Task List View](screenshots/Task%20List%20View.png)
*Create, edit, and manage all your tasks with priority-based color coding and progress tracking*

### Calendar View - Week
![Calendar View - Week](screenshots/Calendar%20View%20-%20Week.png)
*Weekly calendar view showing task distribution with priority-based color coding*

### Calendar View - Month
![Calendar View - Month](screenshots/Calendar%20View%20-%20Month.png)
*Monthly calendar view for long-term task planning and visualization*

### Task Creation
![Task Creation](screenshots/Task%20Creation.png)
*Comprehensive task creation with procrastination coefficient and custom units*

### Progress Tracking
![Progress Tracking](screenshots/Progress%20Track.png)
*Daily progress tracking with automatic completion detection*

### Archive List
![Archive List](screenshots/Archive%20List.png)
*Review completed and overdue tasks with smart filtering options*

## ✨ Features

### 📋 **Multiple View Modes**
- **Task List Mode**: Create, edit, and manage all your tasks
- **Calendar View**: Visualize tasks across weeks or months with priority-based color coding
- **Daily Panel**: Focus on today's tasks with progress tracking
- **Archive View**: Review completed and overdue tasks with filtering options

### 🎯 **Smart Task Management**
- **Procrastination Coefficient**: Adjusts daily workload based on your procrastination level (0-1)
- **Intelligent Scheduling**: Automatically calculates daily workload between start and due dates
- **Priority System**: 5-level priority system with visual indicators
- **Custom Units**: Define your own workload units (pages, points, hours, etc.)

### 📊 **Progress Tracking**
- **Daily Progress Updates**: Track completed work with customizable reminder times
- **Visual Progress Bars**: See completion status at a glance
- **Automatic Task Completion**: Tasks auto-complete when workload reaches zero
- **Overdue Detection**: Automatically identifies and archives overdue tasks

### 🗄️ **Archive System**
- **Smart Filtering**: View all, completed, or overdue tasks separately
- **Task Restoration**: Bring archived tasks back to active status
- **Bulk Management**: Clear entire archive or delete individual tasks
- **Historical Tracking**: Maintain a complete record of your productivity

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x (for local development server)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lazycal.git
   cd lazycal
   ```

2. **Start the local server**
   ```bash
   python3 -m http.server 8000
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000`

### Alternative Setup
Simply open `index.html` directly in your web browser - no server required for basic functionality!

## 📖 How to Use

### 1. Creating Your First Task

1. Click the **"Add Task"** button in the Task List view
2. Fill in the task details:
   - **Name**: What you need to accomplish
   - **Total Workload**: How much work in total (e.g., 20 pages)
   - **Unit**: Choose from presets or create custom units
   - **Start/Due Dates**: When to begin and finish
   - **Priority**: 1 (lowest) to 5 (highest)
   - **Procrastination Coefficient**: 0 (no procrastination) to 1 (maximum)

### 2. Understanding the Procrastination Algorithm

LazyCal uses a smart algorithm to adjust your daily workload:

```
Daily Workload = Total Workload ÷ Available Days (rounded up)
Adjusted Daily Workload = Daily Workload × (1 + Procrastination Coefficient) (rounded down)
```

**Example**: 
- Task: Write 10 pages over 2 days
- Procrastination Coefficient: 0.5
- Calculation: 5 pages/day × 1.5 = 7.5 → 7 pages/day (adjusted)

### 3. Daily Progress Tracking

- Set your preferred reminder time (default: 5:00 PM)
- Receive daily notifications to update progress
- Enter completed workload for each task
- Watch tasks automatically complete or become overdue

### 4. Using Different Views

- **Task List**: Manage all active tasks, sorted by priority and due date
- **Calendar**: See tasks distributed across time with color-coded priorities
- **Daily Panel**: Focus on today's workload and targets
- **Archive**: Review your productivity history and manage completed tasks

## 🎨 Priority Color System

- **Priority 5 (Highest)**: Red - Urgent tasks requiring immediate attention
- **Priority 4 (High)**: Orange - Important tasks with near deadlines
- **Priority 3 (Medium)**: Blue - Standard tasks with moderate importance
- **Priority 2 (Low)**: Yellow - Tasks that can be delayed if necessary
- **Priority 1 (Lowest)**: Gray - Optional or low-impact tasks

## 💾 Data Storage

LazyCal stores all your data locally in your browser using localStorage. This means:
- ✅ Your data stays private and secure
- ✅ No internet connection required after initial load
- ✅ Fast performance with instant updates
- ⚠️ Data is tied to your specific browser and device

### 🔄 Git Synchronization

**NEW**: You can now sync your tasks across multiple computers using Git! LazyCal includes export/import functionality that works perfectly with version control.

#### How to Set Up Git Sync:

1. **Initial Setup** (on your main computer):
   ```bash
   # In your LazyCal directory
   git init
   git add .
   git commit -m "Initial LazyCal setup"
   git remote add origin https://github.com/yourusername/your-lazycal-repo.git
   git push -u origin main
   ```

2. **Export Your Tasks**:
   - Open LazyCal → Settings → Data Synchronization
   - Click "Export Tasks" to download `lazycal-data-YYYY-MM-DD.json`
   - Move this file to your LazyCal directory
   - Rename it to `lazycal-data.json` for consistency

3. **Commit and Push**:
   ```bash
   git add lazycal-data.json
   git commit -m "Update tasks - $(date)"
   git push
   ```

4. **Sync on Other Computers**:
   ```bash
   # Clone or pull the repository
   git clone https://github.com/yourusername/your-lazycal-repo.git
   # or
   git pull

   # Open LazyCal in browser
   # Go to Settings → Data Synchronization
   # Click "Import Tasks" and select lazycal-data.json
   ```

#### Git Workflow Tips:

- **Daily Sync**: Export and commit your tasks at the end of each day
- **Branch Strategy**: Use branches for different contexts (work/personal)
- **Conflict Resolution**: If conflicts occur, the most recent export usually contains the latest data
- **Backup Safety**: LazyCal automatically creates backups before importing

#### Example Git Workflow:
```bash
# Morning routine (pull latest tasks)
git pull
# Import the latest lazycal-data.json in the app

# Evening routine (save your progress)
# Export tasks from the app to lazycal-data.json
git add lazycal-data.json
git commit -m "Tasks update: $(date +%Y-%m-%d)"
git push
```

## 🔧 Configuration

### Settings Available:
- **Daily Reminder Time**: Customize when you receive progress tracking reminders
- **Default Procrastination Coefficient**: Set your typical procrastination level

### Customization Options:
- **Workload Units**: Create custom units for different types of work
- **Priority Levels**: Visual indicators help organize tasks by importance
- **View Preferences**: Switch between different organizational views

## 📱 Browser Compatibility

LazyCal works on all modern browsers:
- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (responsive design)

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Test your changes across different browsers
- Update documentation for new features
- Ensure responsive design compatibility

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports & Feature Requests

Found a bug or have an idea for improvement?
- **Bug Reports**: [Open an issue](https://github.com/bsyben/lazycal/issues) with detailed steps to reproduce
- **Feature Requests**: [Start a discussion](https://github.com/bsyben/lazycal/discussions) to share your ideas

## 🙏 Acknowledgments

- Built with vanilla HTML, CSS, and JavaScript for maximum compatibility
- Icons provided by [Font Awesome](https://fontawesome.com/)
- Inspired by productivity methodologies and procrastination research

## 📊 Project Stats

- **Languages**: HTML, CSS, JavaScript
- **Dependencies**: None (vanilla implementation)
- **Size**: < 100KB total
- **Performance**: Optimized for fast loading and smooth interactions

---

**Made with ❤️ for people who want to overcome procrastination and achieve their goals.**

*Start managing your tasks smarter, not harder with LazyCal!*

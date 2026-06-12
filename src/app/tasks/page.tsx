'use client';

import { useTaskStore, TaskData, SubtaskData } from '@/store/useTaskStore';
import { useEffect, useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Check,
  ChevronRight,
  Info,
  TrendingUp,
  X,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Edit2,
  ListTodo,
  Tag
} from 'lucide-react';

export default function TasksPage() {
  const { tasks, fetchTasks, addTask, updateTask, deleteTask } = useTaskStore();
  const [mounted, setMounted] = useState(false);

  // Add Form State
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('Cá nhân');
  const [dueDate, setDueDate] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [formSubtasks, setFormSubtasks] = useState<{ title: string; completed: boolean }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Form State
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editCategory, setEditCategory] = useState('Cá nhân');
  const [editDueDate, setEditDueDate] = useState('');
  const [editSubtasks, setEditSubtasks] = useState<{ _id?: string; title: string; completed: boolean }[]>([]);
  const [editNewSubtaskTitle, setEditNewSubtaskTitle] = useState('');

  // Expandable Checklist IDs
  const [expandedTaskIds, setExpandedTaskIds] = useState<{ [key: string]: boolean }>({});

  // Filter State
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
    fetchTasks();
  }, [fetchTasks]);

  // URL Parameter trigger on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('openForm') === 'true') {
        setIsOpenForm(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  if (!mounted) {
    return <div style={{ color: 'var(--text-secondary)' }}>Đang tải phân hệ công việc...</div>;
  }

  // Categories list
  const categoriesList = ['Cá nhân', 'Công việc', 'Tài chính', 'Học tập', 'Sức khỏe', 'Khác'];

  // Expand checklist toggler
  const toggleExpandChecklist = (taskId: string) => {
    setExpandedTaskIds(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Add subtask to local form list
  const handleAddSubtaskToForm = () => {
    if (!newSubtaskTitle.trim()) return;
    setFormSubtasks([...formSubtasks, { title: newSubtaskTitle.trim(), completed: false }]);
    setNewSubtaskTitle('');
  };

  // Remove subtask from local form list
  const handleRemoveSubtaskFromForm = (index: number) => {
    setFormSubtasks(formSubtasks.filter((_, i) => i !== index));
  };

  // Task creation submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addTask({
        title,
        description,
        status: 'todo',
        priority,
        category,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        subtasks: formSubtasks
      });
      // Reset Add Form
      setTitle('');
      setDescription('');
      setDueDate('');
      setCategory('Cá nhân');
      setFormSubtasks([]);
      setIsOpenForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Task inline toggle subtask complete check
  const handleToggleSubtask = async (task: TaskData, subtaskIndex: number) => {
    if (!task._id || !task.subtasks) return;

    const updatedSubtasks = task.subtasks.map((sub, idx) => {
      if (idx === subtaskIndex) {
        return { ...sub, completed: !sub.completed };
      }
      return sub;
    });

    try {
      await updateTask(task._id, { subtasks: updatedSubtasks });
    } catch (err) {
      console.error(err);
    }
  };

  // Activate task edit mode
  const handleStartEdit = (task: TaskData) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
    setEditCategory(task.category || 'Cá nhân');
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setEditSubtasks(task.subtasks || []);
  };

  // Add subtask inside editing task
  const handleAddSubtaskInEdit = () => {
    if (!editNewSubtaskTitle.trim()) return;
    setEditSubtasks([...editSubtasks, { title: editNewSubtaskTitle.trim(), completed: false }]);
    setEditNewSubtaskTitle('');
  };

  // Remove subtask inside editing task
  const handleRemoveSubtaskInEdit = (index: number) => {
    setEditSubtasks(editSubtasks.filter((_, i) => i !== index));
  };

  // Submit task updates
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask?._id || !editTitle) return;

    try {
      await updateTask(editingTask._id, {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        category: editCategory,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : undefined,
        subtasks: editSubtasks
      });
      setEditingTask(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: 'todo' | 'in_progress' | 'done') => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    try {
      await updateTask(id, { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveToInProgress = async (id: string) => {
    try {
      await updateTask(id, { status: 'in_progress' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      await deleteTask(id);
    }
  };

  // Filter list
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'pending') {
      matchesStatus = task.status !== 'done';
    } else if (statusFilter === 'completed') {
      matchesStatus = task.status === 'done';
    }

    return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
  });

  // Unique categories list from existing tasks for filter options
  const uniqueCategories = Array.from(new Set(tasks.map(t => t.category || 'Cá nhân')));

  // Timeline groups
  const getTimelineGroups = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTime = new Date(todayStr).getTime();

    const overdue: TaskData[] = [];
    const today: TaskData[] = [];
    const upcoming: TaskData[] = [];
    const noDueDate: TaskData[] = [];
    const completed: TaskData[] = [];

    // Sort chronologically
    const sorted = [...filteredTasks].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    sorted.forEach((task) => {
      if (task.status === 'done') {
        completed.push(task);
        return;
      }

      if (!task.dueDate) {
        noDueDate.push(task);
        return;
      }

      const taskDateStr = new Date(task.dueDate).toISOString().split('T')[0];
      const taskTime = new Date(taskDateStr).getTime();

      if (taskTime < todayTime) {
        overdue.push(task);
      } else if (taskTime === todayTime) {
        today.push(task);
      } else {
        upcoming.push(task);
      }
    });

    return { overdue, today, upcoming, noDueDate, completed };
  };

  const { overdue, today, upcoming, noDueDate, completed } = getTimelineGroups();

  const getPriorityStyle = (pri: string) => {
    switch (pri) {
      case 'high':
        return { background: 'rgba(244, 63, 94, 0.12)', color: 'var(--color-expense)', dotColor: 'var(--color-expense)' };
      case 'medium':
        return { background: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-gold)', dotColor: 'var(--color-gold)' };
      default:
        return { background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-income)', dotColor: 'var(--color-income)' };
    }
  };

  const getPriorityLabel = (pri: string) => {
    switch (pri) {
      case 'high': return 'Khẩn cấp';
      case 'medium': return 'Trung bình';
      default: return 'Thấp';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Công việc': return '#6366f1';
      case 'Tài chính': return '#10b981';
      case 'Học tập': return '#8b5cf6';
      case 'Sức khỏe': return '#f43f5e';
      default: return '#f59e0b';
    }
  };

  // Render task items
  const renderTimelineItem = (task: TaskData) => {
    const priStyle = getPriorityStyle(task.priority);
    const isCompleted = task.status === 'done';
    
    // Subtask calculations
    const subtasks = task.subtasks || [];
    const totalSub = subtasks.length;
    const completedSub = subtasks.filter(s => s.completed).length;
    const subPercent = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;

    const isExpanded = !!expandedTaskIds[task._id || ''];

    return (
      <div key={task._id} className="timeline-item animate-fade-in">
        {/* Timeline dot */}
        <div 
          className="timeline-dot" 
          style={{ 
            background: isCompleted ? 'var(--color-income)' : priStyle.dotColor,
            boxShadow: `0 0 8px ${isCompleted ? 'var(--color-income)' : priStyle.dotColor}`
          }} 
        />
        
        <div className="timeline-card" style={{ borderLeft: `4px solid ${getCategoryColor(task.category)}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyItems: 'space-between', gap: '14px' }}>
            
            {/* Action checkbox status check */}
            <button 
              onClick={() => task._id && handleToggleStatus(task._id, task.status)}
              style={{ 
                cursor: 'pointer', 
                background: 'transparent', 
                border: 'none', 
                color: isCompleted ? 'var(--color-income)' : 'var(--text-muted)',
                marginTop: '3px',
                padding: 0
              }}
            >
              <CheckCircle2 size={22} fill={isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'transparent'} />
            </button>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div className="flex-between" style={{ flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ 
                  fontSize: '1.025rem', 
                  fontWeight: 700,
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                  wordBreak: 'break-word'
                }}>
                  {task.title}
                </h4>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge" style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.7rem' 
                  }}>
                    <Tag size={10} style={{ marginRight: '4px', color: getCategoryColor(task.category) }} />
                    {task.category}
                  </span>
                  
                  <span className="badge" style={{ ...priStyle, fontSize: '0.7rem' }}>
                    {getPriorityLabel(task.priority)}
                  </span>
                </div>
              </div>

              {task.description && (
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--text-secondary)', 
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  wordBreak: 'break-word',
                  marginTop: '4px' 
                }}>
                  {task.description}
                </p>
              )}

              {/* Subtask Progress indicator */}
              {totalSub > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                  <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ListTodo size={12} />
                       Checklist việc phụ: {completedSub}/{totalSub}
                    </span>
                    <span>{subPercent}%</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${subPercent}%`, height: '100%', background: 'var(--color-task)', transition: 'width 0.3s ease' }} />
                  </div>

                  {/* Expand Checklist toggler */}
                  <button 
                    onClick={() => toggleExpandChecklist(task._id!)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px', 
                      background: 'transparent', 
                      border: 'none', 
                      fontSize: '0.75rem', 
                      color: 'var(--accent-primary)',
                      cursor: 'pointer',
                      padding: '4px 0',
                      alignSelf: 'flex-start'
                    }}
                  >
                    {isExpanded ? (
                      <>Thu gọn checklist <ChevronUp size={12} /></>
                    ) : (
                      <>Xem checklist chi tiết <ChevronDown size={12} /></>
                    )}
                  </button>

                  {/* Expanded Subtask List */}
                  {isExpanded && (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '8px', 
                      padding: '12px', 
                      background: 'rgba(255,255,255,0.015)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      marginTop: '6px'
                    }}>
                      {subtasks.map((sub, sIdx) => (
                        <label key={sub._id || sIdx} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px', 
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          color: sub.completed ? 'var(--text-muted)' : 'var(--text-secondary)'
                        }}>
                          <input 
                            type="checkbox" 
                            checked={sub.completed}
                            onChange={() => handleToggleSubtask(task, sIdx)}
                            style={{ 
                              cursor: 'pointer',
                              width: '14px',
                              height: '14px',
                              accentColor: 'var(--color-task)'
                            }}
                          />
                          <span style={{ textDecoration: sub.completed ? 'line-through' : 'none' }}>{sub.title}</span>
                        </label>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* Task Footer Actions */}
              <div className="flex-between" style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} />
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Không hạn chót'}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {!isCompleted && task.status === 'todo' && (
                    <button 
                      onClick={() => task._id && handleMoveToInProgress(task._id)}
                      className="task-action-btn"
                      style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      Làm ngay <ChevronRight size={12} />
                    </button>
                  )}
                  {isCompleted && (
                    <button 
                      onClick={() => task._id && handleToggleStatus(task._id, task.status)}
                      className="task-action-btn"
                      style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RotateCcw size={12} /> Làm lại
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleStartEdit(task)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}
                    title="Chỉnh sửa công việc"
                  >
                    <Edit2 size={13} className="hover-accent-icon" />
                  </button>

                  <button 
                    onClick={() => task._id && handleDelete(task._id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}
                    title="Xóa công việc"
                  >
                    <Trash2 size={14} className="hover-red-icon" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  };

  // Stats sums
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Header summaries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="glass-card flex-between" style={{ padding: '16px' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>TỔNG CÔNG VIỆC</p>
            <h3 style={{ fontSize: '1.45rem', marginTop: '4px' }}>{totalTasks}</h3>
          </div>
          <Clock size={24} style={{ color: 'var(--text-muted)' }} />
        </div>
        
        <div className="glass-card flex-between" style={{ padding: '16px', borderLeft: '3px solid var(--color-expense)' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>CẦN LÀM</p>
            <h3 style={{ fontSize: '1.45rem', marginTop: '4px', color: 'var(--color-expense)' }}>{todoCount}</h3>
          </div>
          <AlertCircle size={24} style={{ color: 'var(--color-expense)' }} />
        </div>

        <div className="glass-card flex-between" style={{ padding: '16px', borderLeft: '3px solid var(--color-gold)' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>ĐANG LÀM</p>
            <h3 style={{ fontSize: '1.45rem', marginTop: '4px', color: 'var(--color-gold)' }}>{inProgressCount}</h3>
          </div>
          <TrendingUp size={24} style={{ color: 'var(--color-gold)' }} />
        </div>

        <div className="glass-card flex-between" style={{ padding: '16px', borderLeft: '3px solid var(--color-income)' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>ĐÃ XONG</p>
            <h3 style={{ fontSize: '1.45rem', marginTop: '4px', color: 'var(--color-income)' }}>{completedTasks}</h3>
          </div>
          <CheckCircle2 size={24} style={{ color: 'var(--color-income)' }} />
        </div>
      </div>

      {/* Floating Action Button for Mobile Add */}
      <button 
        className="btn btn-primary flex-center mobile-only-btn" 
        onClick={() => setIsOpenForm(true)}
        style={{ display: 'none', gap: '8px', zIndex: 80 }}
      >
        <Plus size={20} />
        Thêm công việc
      </button>

      {/* 2. Main layout */}
      <div className="tasks-layout">
        
        {/* Left Column: Timeline Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
          
          {/* Filters Bar */}
          <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--color-gold)' }} />
              <span style={{ fontWeight: 700 }}>Bộ lọc & Tìm kiếm công việc</span>
            </div>

            <div className="filters-grid">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Trạng thái</label>
                <select 
                  className="form-input" 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chưa hoàn thành</option>
                  <option value="completed">Đã hoàn thành</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Độ ưu tiên</label>
                <select 
                  className="form-input" 
                  value={priorityFilter} 
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                >
                  <option value="all">Tất cả độ ưu tiên</option>
                  <option value="high">Khẩn cấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="low">Thấp</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Danh mục</label>
                <select 
                  className="form-input" 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                >
                  <option value="all">Tất cả danh mục</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Tìm kiếm tiêu đề/mô tả</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Nhập từ khóa tìm kiếm..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>
          </div>

          {/* Timeline View of Tasks */}
          <div className="glass-card" style={{ flex: 1, padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Dòng thời gian công việc</h3>
            
            {filteredTasks.length === 0 ? (
              <div className="flex-center" style={{ padding: '60px 0', flexDirection: 'column', gap: '12px', color: 'var(--text-muted)' }}>
                <Info size={32} />
                <span>Không tìm thấy công việc nào phù hợp.</span>
              </div>
            ) : (
              <div className="timeline-container">
                <div className="timeline-line" />

                {/* Section: Overdue */}
                {overdue.length > 0 && (
                  <div className="timeline-group">
                    <h5 className="timeline-group-title" style={{ color: 'var(--color-expense)' }}>
                      <AlertCircle size={14} /> Quá hạn ({overdue.length})
                    </h5>
                    {overdue.map(renderTimelineItem)}
                  </div>
                )}

                {/* Section: Today */}
                {today.length > 0 && (
                  <div className="timeline-group">
                    <h5 className="timeline-group-title" style={{ color: 'var(--color-gold)' }}>
                      <Clock size={14} /> Hôm nay ({today.length})
                    </h5>
                    {today.map(renderTimelineItem)}
                  </div>
                )}

                {/* Section: Upcoming */}
                {upcoming.length > 0 && (
                  <div className="timeline-group">
                    <h5 className="timeline-group-title" style={{ color: 'var(--accent-primary)' }}>
                      <Calendar size={14} /> Sắp tới ({upcoming.length})
                    </h5>
                    {upcoming.map(renderTimelineItem)}
                  </div>
                )}

                {/* Section: No Due Date */}
                {noDueDate.length > 0 && (
                  <div className="timeline-group">
                    <h5 className="timeline-group-title" style={{ color: 'var(--text-secondary)' }}>
                      <Info size={14} /> Không có hạn chót ({noDueDate.length})
                    </h5>
                    {noDueDate.map(renderTimelineItem)}
                  </div>
                )}

                {/* Section: Completed */}
                {completed.length > 0 && (
                  <div className="timeline-group">
                    <h5 className="timeline-group-title" style={{ color: 'var(--color-income)' }}>
                      <Check size={14} /> Đã hoàn thành ({completed.length})
                    </h5>
                    {completed.map(renderTimelineItem)}
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

        {/* Right Column: Add Form panel (Desktop side-by-side / Mobile slide-up sheet) */}
        <div className={`tasks-side-panel ${isOpenForm ? 'active' : ''}`}>
          <div className="glass-card" style={{ position: 'sticky', top: 'calc(var(--header-height) + 24px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="flex-between">
              <h3 style={{ fontSize: '1.15rem' }}>Thêm công việc</h3>
              <button className="close-form-btn" onClick={() => setIsOpenForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Tên công việc</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ví dụ: Đóng tiền nước nhà..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Mức độ ưu tiên</label>
                <select 
                  className="form-input"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  required
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Khẩn cấp</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Danh mục</label>
                <select 
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Hạn chót (Tùy chọn)</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Mô tả công việc (Tùy chọn)</label>
                <textarea 
                  className="form-input" 
                  placeholder="Mô tả cụ thể nhiệm vụ..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ minHeight: '60px', resize: 'vertical' }}
                />
              </div>

              {/* Subtask Input Field inside Form */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Thêm checklist việc phụ (Tùy chọn)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Tên việc phụ..." 
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={handleAddSubtaskToForm}
                    style={{ padding: '10px 14px' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                {/* Form Subtask Checklist Render */}
                {formSubtasks.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '6px', 
                    marginTop: '8px', 
                    padding: '10px', 
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)' 
                  }}>
                    {formSubtasks.map((sub, sIdx) => (
                      <div key={sIdx} className="flex-between" style={{ fontSize: '0.8rem' }}>
                        <span>• {sub.title}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSubtaskFromForm(sIdx)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--color-expense)', cursor: 'pointer' }}
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '8px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang tạo...' : 'Tạo công việc'}
              </button>

            </form>
          </div>
        </div>

        {/* Slide-out Edit Modal Panel */}
        {editingTask && (
          <div className="edit-task-overlay">
            <div className="edit-task-panel glass-card">
              <div className="flex-between" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem' }}>Chỉnh sửa công việc</h3>
                <button 
                  onClick={() => setEditingTask(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Tên công việc</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Độ ưu tiên</label>
                  <select 
                    className="form-input"
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Khẩn cấp</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Danh mục</label>
                  <select 
                    className="form-input"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Hạn chót</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Mô tả chi tiết</label>
                  <textarea 
                    className="form-input" 
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    style={{ minHeight: '60px', resize: 'vertical' }}
                  />
                </div>

                {/* Subtask editing section */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Quản lý việc phụ (Checklist)</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Thêm việc phụ mới..." 
                      value={editNewSubtaskTitle}
                      onChange={(e) => setEditNewSubtaskTitle(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={handleAddSubtaskInEdit}
                      style={{ padding: '10px 14px' }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {editSubtasks.length > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '8px', 
                      maxHeight: '150px', 
                      overflowY: 'auto',
                      padding: '10px',
                      background: 'rgba(0,0,0,0.1)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      {editSubtasks.map((sub, sIdx) => (
                        <div key={sub._id || sIdx} className="flex-between">
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={sub.completed}
                              onChange={() => {
                                const updated = editSubtasks.map((s, si) => si === sIdx ? { ...s, completed: !s.completed } : s);
                                setEditSubtasks(updated);
                              }}
                              style={{ accentColor: 'var(--color-task)' }}
                            />
                            <span style={{ textDecoration: sub.completed ? 'line-through' : 'none' }}>{sub.title}</span>
                          </label>
                          <button 
                            type="button"
                            onClick={() => handleRemoveSubtaskInEdit(sIdx)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--color-expense)', cursor: 'pointer', fontSize: '0.75rem' }}
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ flex: 1 }}
                  >
                    Lưu thay đổi
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setEditingTask(null)}
                  >
                    Hủy
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>

      <style jsx global>{`
        .tasks-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .task-action-btn {
          cursor: pointer;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          border-radius: 6px;
          padding: 6px 12px;
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        [data-theme="light"] .task-action-btn {
          background: rgba(0, 0, 0, 0.02);
        }

        .task-action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          border-color: var(--border-color-hover);
        }

        [data-theme="light"] .task-action-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .hover-red-icon, .hover-accent-icon {
          transition: color var(--transition-fast);
        }

        .hover-red-icon:hover {
          color: var(--color-expense) !important;
        }

        .hover-accent-icon:hover {
          color: var(--accent-primary) !important;
        }

        .close-form-btn {
          display: none;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
        }

        /* Edit Overlay Styles */
        .edit-task-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
        }

        .edit-task-panel {
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          animation: scaleUp 0.2s ease forwards;
        }

        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 992px) {
          .tasks-layout {
            grid-template-columns: 1fr;
          }

          .tasks-side-panel {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100vw;
            height: 85vh;
            background: var(--bg-secondary);
            border-top: 1px solid var(--border-color);
            border-top-left-radius: var(--radius-lg);
            border-top-right-radius: var(--radius-lg);
            z-index: 150;
            transform: translateY(100%);
            transition: transform var(--transition-normal);
            overflow-y: auto;
            padding-bottom: env(safe-area-inset-bottom, 0px);
          }

          .tasks-side-panel.active {
            transform: translateY(0);
            box-shadow: 0 -8px 32px rgba(0,0,0,0.5);
          }

          .tasks-side-panel .glass-card {
            border: none;
            box-shadow: none;
            background: transparent;
            padding: 24px;
            backdrop-filter: none;
          }

          .close-form-btn {
            display: block;
          }

          .mobile-only-btn {
            display: flex !important;
            position: fixed;
            bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px) + 16px);
            right: 16px;
            box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
            border-radius: var(--radius-full);
            padding: 14px 24px;
          }
        }

        @media (max-width: 768px) {
          .filters-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
        }
      `}</style>

    </div>
  );
}

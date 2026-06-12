'use client';

import { useTaskStore, TaskData } from '@/store/useTaskStore';
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
  PlusCircle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function TasksPage() {
  const { tasks, fetchTasks, addTask, updateTask, deleteTask } = useTaskStore();
  const [mounted, setMounted] = useState(false);

  // Form State
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter State
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
    fetchTasks();
  }, [fetchTasks]);

  if (!mounted) {
    return <div style={{ color: 'var(--text-secondary)' }}>Đang tải phân hệ công việc...</div>;
  }

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
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined
      });
      // Reset Form
      setTitle('');
      setDescription('');
      setDueDate('');
      setIsOpenForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
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

  // Filter logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'pending') {
      matchesStatus = task.status !== 'done';
    } else if (statusFilter === 'completed') {
      matchesStatus = task.status === 'done';
    }

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Timeline Grouping
  const getTimelineGroups = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTime = new Date(todayStr).getTime();

    const overdue: TaskData[] = [];
    const today: TaskData[] = [];
    const upcoming: TaskData[] = [];
    const noDueDate: TaskData[] = [];
    const completed: TaskData[] = [];

    // Sort filtered tasks chronologically
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
        return { background: 'rgba(244, 63, 94, 0.15)', color: 'var(--color-expense)', dotColor: 'var(--color-expense)' };
      case 'medium':
        return { background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-gold)', dotColor: 'var(--color-gold)' };
      default:
        return { background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-income)', dotColor: 'var(--color-income)' };
    }
  };

  const getPriorityLabel = (pri: string) => {
    switch (pri) {
      case 'high': return 'Khẩn cấp';
      case 'medium': return 'Trung bình';
      default: return 'Thấp';
    }
  };

  // Stats for the general view
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'done').length;
  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;

  // Render a Single Task in the Timeline
  const renderTimelineItem = (task: TaskData) => {
    const priStyle = getPriorityStyle(task.priority);
    const isCompleted = task.status === 'done';

    return (
      <div key={task._id} className="timeline-item animate-fade-in">
        {/* The Timeline dot representing priority/status */}
        <div 
          className="timeline-dot" 
          style={{ 
            background: isCompleted ? 'var(--color-income)' : priStyle.dotColor,
            boxShadow: `0 0 8px ${isCompleted ? 'var(--color-income)' : priStyle.dotColor}`
          }} 
        />
        
        <div className="timeline-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyItems: 'space-between', gap: '16px' }}>
            {/* Completion checkbox check */}
            <button 
              onClick={() => task._id && handleToggleStatus(task._id, task.status)}
              style={{ 
                cursor: 'pointer', 
                background: 'transparent', 
                border: 'none', 
                color: isCompleted ? 'var(--color-income)' : 'var(--text-muted)',
                marginTop: '3px',
                transition: 'color var(--transition-fast)'
              }}
              title={isCompleted ? "Đánh dấu là chưa hoàn thành" : "Đánh dấu là đã hoàn thành"}
            >
              <CheckCircle2 size={20} fill={isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'transparent'} />
            </button>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="flex-between" style={{ flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ 
                  fontSize: '1rem', 
                  fontWeight: 600, 
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                  wordBreak: 'break-word'
                }}>
                  {task.title}
                </h4>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge" style={priStyle}>
                    {getPriorityLabel(task.priority)}
                  </span>
                  {task.status === 'in_progress' && (
                    <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--color-task)' }}>
                      Đang làm
                    </span>
                  )}
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
                      Bắt đầu làm <ChevronRight size={12} />
                    </button>
                  )}
                  {isCompleted && (
                    <button 
                      onClick={() => task._id && handleToggleStatus(task._id, task.status)}
                      className="task-action-btn"
                      style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Làm lại công việc này"
                    >
                      <RotateCcw size={12} /> Làm lại
                    </button>
                  )}
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Header summaries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="glass-card flex-between" style={{ padding: '16px' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>TỔNG CÔNG VIỆC</p>
            <h3 style={{ fontSize: '1.45rem', marginTop: '4px' }}>{totalCount}</h3>
          </div>
          <Clock size={24} style={{ color: 'var(--text-muted)' }} />
        </div>
        
        <div className="glass-card flex-between" style={{ padding: '16px', borderLeft: '3px solid var(--color-expense)' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>CẦN THỰC HIỆN</p>
            <h3 style={{ fontSize: '1.45rem', marginTop: '4px', color: 'var(--color-expense)' }}>{todoCount}</h3>
          </div>
          <AlertCircle size={24} style={{ color: 'var(--color-expense)' }} />
        </div>

        <div className="glass-card flex-between" style={{ padding: '16px', borderLeft: '3px solid var(--color-gold)' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>ĐANG THỰC HIỆN</p>
            <h3 style={{ fontSize: '1.45rem', marginTop: '4px', color: 'var(--color-gold)' }}>{inProgressCount}</h3>
          </div>
          <TrendingUp size={24} style={{ color: 'var(--color-gold)' }} />
        </div>

        <div className="glass-card flex-between" style={{ padding: '16px', borderLeft: '3px solid var(--color-income)' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>ĐÃ HOÀN THÀNH</p>
            <h3 style={{ fontSize: '1.45rem', marginTop: '4px', color: 'var(--color-income)' }}>{completedCount}</h3>
          </div>
          <CheckCircle2 size={24} style={{ color: 'var(--color-income)' }} />
        </div>
      </div>

      {/* Floating Action Button for Mobile form toggle */}
      <button 
        className="btn btn-primary flex-center mobile-only-btn" 
        onClick={() => setIsOpenForm(true)}
        style={{ display: 'none', gap: '8px', zIndex: 80 }}
      >
        <Plus size={20} />
        Thêm công việc
      </button>

      {/* 2. Main Layout Grid */}
      <div className="tasks-layout">
        
        {/* Timeline Panel */}
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

              <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                <label className="form-label">Tìm kiếm tiêu đề/mô tả</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Nhập tiêu đề hoặc mô tả..." 
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
                {/* Vertical line track */}
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

        {/* Form panel: Desktop side-by-side / Mobile slide-up bottom sheet */}
        <div className={`tasks-side-panel ${isOpenForm ? 'active' : ''}`}>
          <div className="glass-card" style={{ position: 'sticky', top: 'calc(var(--header-height) + 24px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="flex-between">
              <h3 style={{ fontSize: '1.15rem' }}>Thêm công việc</h3>
              <button className="close-form-btn" onClick={() => setIsOpenForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
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
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '8px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang thêm...' : 'Tạo công việc'}
              </button>

            </form>
          </div>
        </div>

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
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          border-radius: 6px;
          padding: 6px 12px;
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        [data-theme="light"] .task-action-btn {
          background: rgba(0, 0, 0, 0.03);
        }

        .task-action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          border-color: var(--border-color-hover);
        }

        [data-theme="light"] .task-action-btn:hover {
          background: rgba(0, 0, 0, 0.06);
        }

        .hover-red-icon {
          transition: color var(--transition-fast);
        }

        .hover-red-icon:hover {
          color: var(--color-expense) !important;
        }

        .close-form-btn {
          display: none;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
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
            height: 80vh;
            background: var(--bg-secondary);
            border-top: 1px solid var(--border-color);
            border-top-left-radius: var(--radius-lg);
            border-top-right-radius: var(--radius-lg);
            z-index: 150;
            transform: translateY(100%);
            transition: transform var(--transition-normal);
            overflow-y: auto;
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
            bottom: calc(var(--bottom-nav-height) + 16px);
            right: 16px;
            box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
            border-radius: var(--radius-full);
            padding: 14px 24px;
          }
        }
      `}</style>

    </div>
  );
}

package models

import (
	"time"

	"gorm.io/gorm"
)

type Task struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	UserID      uint           `gorm:"not null;index" json:"user_id"`
	CategoryID  *uint          `gorm:"index" json:"category_id"`
	Category    *Category      `gorm:"foreignKey:CategoryID" json:"category"`
	Title       string         `gorm:"not null" json:"title"`
	Description string         `json:"description"`
	Status      string         `gorm:"default:'pending'" json:"status"`  // pending, in_progress, completed
	Priority    string         `gorm:"default:'medium'" json:"priority"` // low, medium, high
	DueDate     *time.Time     `json:"due_date"`
	Subtasks    []Subtask      `gorm:"foreignKey:TaskID" json:"subtasks"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type Category struct {
	ID     uint   `gorm:"primaryKey" json:"id"`
	UserID uint   `gorm:"not null;index" json:"user_id"`
	Name   string `gorm:"not null" json:"name"`
	Color  string `json:"color"` // hex code or tailwind color name
}

type Subtask struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	TaskID      uint           `gorm:"not null;index" json:"task_id"`
	Title       string         `gorm:"not null" json:"title"`
	IsCompleted bool           `gorm:"default:false" json:"is_completed"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

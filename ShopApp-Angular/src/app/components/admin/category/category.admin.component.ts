import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category';

@Component({
  selector: 'app-category-admin',
  templateUrl: './category.admin.component.html',
  styleUrls: ['./category.admin.component.scss'],
})
export class CategoryAdminComponent implements OnInit {
  categories: Category[] = [];
  categoryName: string = '';
  isEditMode: boolean = false;
  editCategoryId: number = 0;

  constructor(
    private router: Router,
    private categoryService: CategoryService,
  ) {}

  ngOnInit() {
    this.getAllCategories();
  }

  getAllCategories() {
    this.categoryService.getCategories(0, 100).subscribe({
      next: (categories: Category[]) => {
        this.categories = categories;
      },
      error: (error: any) => {
        console.error('Lỗi khi lấy danh mục:', error);
      },
    });
  }

  saveCategory() {
    if (!this.categoryName.trim()) {
      alert('Tên danh mục không được để trống');
      return;
    }

    if (this.isEditMode) {
      this.categoryService
        .updateCategory(this.editCategoryId, { name: this.categoryName })
        .subscribe({
          next: () => {
            alert('Cập nhật thành công');
            this.resetForm();
            this.getAllCategories();
          },
          error: (err) => alert(err.error.message),
        });
    } else {
      this.categoryService
        .createCategory({ name: this.categoryName })
        .subscribe({
          next: () => {
            alert('Thêm thành công');
            this.resetForm();
            this.getAllCategories();
          },
          error: (err) => alert(err.error.message),
        });
    }
  }

  editCategory(category: Category) {
    this.isEditMode = true;
    this.editCategoryId = category.id;
    this.categoryName = category.name;
  }

  deleteCategory(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          alert('Xóa thành công');
          this.getAllCategories();
        },
        error: (err) => alert(err.error.message),
      });
    }
  }

  resetForm() {
    this.isEditMode = false;
    this.categoryName = '';
    this.editCategoryId = 0;
  }
}

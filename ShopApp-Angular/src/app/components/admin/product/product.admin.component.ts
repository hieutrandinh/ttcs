import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { Product } from '../../../models/product';
import { Category } from '../../../models/category';

@Component({
  selector: 'app-product-admin',
  templateUrl: './product.admin.component.html',
  styleUrls: ['./product.admin.component.scss'],
})
export class ProductAdminComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];

  // Các biến phân trang
  currentPage: number = 0;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  keyword: string = '';
  visiblePages: number[] = [];

  // Quản lý trạng thái Form
  showForm: boolean = false;
  isEditMode: boolean = false;
  editProductId: number = 0;

  productForm: any = {
    name: '',
    price: 0,
    description: '',
    category_id: 0,
  };

  constructor(
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService,
  ) {}

  ngOnInit() {
    this.getAllCategories();
    this.getAllProducts(this.keyword, this.currentPage, this.itemsPerPage);
  }

  getAllCategories() {
    this.categoryService.getCategories(0, 100).subscribe({
      next: (data) => (this.categories = data),
    });
  }

  getAllProducts(keyword: string, page: number, limit: number) {
    this.productService.getProducts(keyword, 0, page, limit).subscribe({
      next: (response: any) => {
        this.products = response.products;
        this.totalPages = response.totalPages;
        this.visiblePages = this.generateVisiblePageArray(
          this.currentPage,
          this.totalPages,
        );
      },
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getAllProducts(this.keyword, this.currentPage, this.itemsPerPage);
  }

  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(currentPage - halfVisiblePages, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }
    return new Array(endPage - startPage + 1)
      .fill(0)
      .map((_, index) => startPage + index);
  }

  // Hàm kích hoạt chế độ Sửa sản phẩm
  editProduct(product: Product) {
    this.isEditMode = true;
    this.editProductId = product.id;
    this.showForm = true; // Mở form lên

    // Đổ dữ liệu hiện tại của sản phẩm vào form
    this.productForm = {
      name: product.name,
      price: product.price,
      description: product.description,
      category_id: product.category_id,
    };
  }

  // Hàm xử lý Lưu (Thêm mới hoặc Cập nhật)
  saveProduct() {
    if (
      !this.productForm.name.trim() ||
      this.productForm.price <= 0 ||
      this.productForm.category_id === 0
    ) {
      alert('Vui lòng điền đầy đủ thông tin sản phẩm hợp lệ');
      return;
    }

    if (this.isEditMode) {
      // Gọi API cập nhật sản phẩm nếu đang ở chế độ sửa
      this.productService
        .updateProduct(this.editProductId, this.productForm)
        .subscribe({
          next: () => {
            alert('Cập nhật sản phẩm thành công!');
            this.resetForm();
            this.getAllProducts(
              this.keyword,
              this.currentPage,
              this.itemsPerPage,
            );
          },
          error: (err) => alert('Lỗi khi cập nhật: ' + err.error),
        });
    } else {
      // Gọi API thêm mới nếu đang ở chế độ bình thường
      this.productService.createProduct(this.productForm).subscribe({
        next: () => {
          alert('Thêm sản phẩm thành công!');
          this.resetForm();
          this.getAllProducts(
            this.keyword,
            this.currentPage,
            this.itemsPerPage,
          );
        },
        error: (err) => alert('Lỗi khi thêm: ' + err.error),
      });
    }
  }

  deleteProduct(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          alert('Xóa thành công');
          this.getAllProducts(
            this.keyword,
            this.currentPage,
            this.itemsPerPage,
          );
        },
        error: (err) => alert('Lỗi: ' + err.message),
      });
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.showForm = false;
    this.isEditMode = false;
    this.editProductId = 0;
    this.productForm = {
      name: '',
      price: 0,
      description: '',
      category_id: 0,
    };
  }
}

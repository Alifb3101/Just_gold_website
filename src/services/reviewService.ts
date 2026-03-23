import { api } from './api';

export interface ReviewImage {
  id?: number;
  cloudinary_public_id: string;
  cloudinary_url: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string;
  rating: number;
  title: string;
  comment?: string;
  images?: ReviewImage[];
  helpful_count: number;
  unhelpful_count: number;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewsResponse {
  data: {
    reviews: Review[];
    total: number;
    page: number;
    limit: number;
    stats: {
      average_rating: number;
      total_reviews: number;
      rating_distribution: Record<1 | 2 | 3 | 4 | 5, number>;
    };
  };
  success: boolean;
}

export interface CreateReviewPayload {
  rating: number;
  title: string;
  comment?: string;
  images?: File[];
}

export const reviewService = {
  // Get all reviews for a product
  async getProductReviews(
    productId: number,
    page = 1,
    limit = 10,
    sort: 'recent' | 'helpful' | 'rating' = 'recent'
  ): Promise<ReviewsResponse> {
    try {
      const response = await api.get(
        `/products/${productId}/reviews?page=${page}&limit=${limit}&sort=${sort}`
      );
      return response.data;
    } catch (error) {
      console.error('[reviewService] Error fetching reviews:', error);
      throw error;
    }
  },

  // Get single review
  async getReview(reviewId: number): Promise<{ data: Review; success: boolean }> {
    try {
      const response = await api.get(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('[reviewService] Error fetching review:', error);
      throw error;
    }
  },

  // Create review with optional images
  async createReview(productId: number, payload: CreateReviewPayload): Promise<{ data: Review; success: boolean }> {
    try {
      const formData = new FormData();
      formData.append('rating', String(payload.rating));
      formData.append('title', payload.title);
      if (payload.comment) {
        formData.append('comment', payload.comment);
      }
      if (payload.images && payload.images.length > 0) {
        payload.images.forEach((image, index) => {
          formData.append(`images`, image);
        });
      }

      const response = await api.post(`/products/${productId}/reviews`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('[reviewService] Error creating review:', error);
      throw error;
    }
  },

  // Update review
  async updateReview(reviewId: number, payload: Partial<CreateReviewPayload>): Promise<{ data: Review; success: boolean }> {
    try {
      const formData = new FormData();
      if (payload.rating !== undefined) {
        formData.append('rating', String(payload.rating));
      }
      if (payload.title) {
        formData.append('title', payload.title);
      }
      if (payload.comment) {
        formData.append('comment', payload.comment);
      }
      if (payload.images && payload.images.length > 0) {
        payload.images.forEach((image) => {
          formData.append(`images`, image);
        });
      }

      const response = await api.put(`/reviews/${reviewId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('[reviewService] Error updating review:', error);
      throw error;
    }
  },

  // Delete review
  async deleteReview(reviewId: number): Promise<{ success: boolean }> {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('[reviewService] Error deleting review:', error);
      throw error;
    }
  },

  // Mark review as helpful/unhelpful
  async markHelpful(reviewId: number, type: 'helpful' | 'unhelpful'): Promise<{ data: Review; success: boolean }> {
    try {
      const response = await api.post(`/reviews/${reviewId}/helpful`, {
        type,
      });
      return response.data;
    } catch (error) {
      console.error('[reviewService] Error marking review:', error);
      throw error;
    }
  },
};

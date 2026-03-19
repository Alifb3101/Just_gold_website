import React, { useState, useEffect, useCallback } from 'react';
import { Star, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { reviewService, Review, ReviewsResponse } from '@/services/reviewService';
import { useAuth } from '@/app/contexts/AuthContext';

interface ReviewsProps {
  productId: number;
}

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-300'}
      />
    ))}
  </div>
);

const ReviewCard: React.FC<{ review: Review; onHelpful: (reviewId: number, type: 'helpful' | 'unhelpful') => void }> = ({
  review,
  onHelpful,
}) => {
  const [isMarkingHelpful, setIsMarkingHelpful] = useState(false);

  const handleMarkHelpful = async (type: 'helpful' | 'unhelpful', e: React.MouseEvent) => {
    e.preventDefault();
    setIsMarkingHelpful(true);
    try {
      await onHelpful(review.id, type);
    } finally {
      setIsMarkingHelpful(false);
    }
  };

  return (
    <div className="border-b border-gray-200 py-4 last:border-b-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-sm text-[#3E2723]">{review.user_name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Stars rating={review.rating} />
            {review.is_verified_purchase && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                Verified Purchase
              </span>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(review.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Title and Comment */}
      <h4 className="font-semibold text-sm text-[#3E2723] mt-3">{review.title}</h4>
      {review.comment && <p className="text-sm text-gray-700 mt-2 leading-relaxed">{review.comment}</p>}

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {review.images.map((img) => (
            <img
              key={img.cloudinary_public_id}
              src={img.cloudinary_url}
              alt="Review"
              className="w-20 h-20 object-cover rounded border border-gray-200 flex-shrink-0"
            />
          ))}
        </div>
      )}

      {/* Helpful Buttons */}
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={(e) => handleMarkHelpful('helpful', e)}
          disabled={isMarkingHelpful}
          className="flex items-center gap-1 text-xs text-gray-600 hover:text-[#D4AF37] transition-colors disabled:opacity-50"
        >
          <ThumbsUp size={14} />
          <span>Helpful ({review.helpful_count})</span>
        </button>
        <button
          onClick={(e) => handleMarkHelpful('unhelpful', e)}
          disabled={isMarkingHelpful}
          className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-500 transition-colors disabled:opacity-50"
        >
          <ThumbsDown size={14} />
          <span>Not Helpful ({review.unhelpful_count})</span>
        </button>
      </div>
    </div>
  );
};

const RatingDistribution = ({ stats }: { stats: ReviewsResponse['data']['stats'] }) => {
  if (!stats?.rating_distribution || Object.keys(stats.rating_distribution).length === 0) {
    return null;
  }

  const maxCount = Math.max(
    ...Object.values(stats.rating_distribution).filter((v) => typeof v === 'number'),
    1
  ) as number;

  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = (stats.rating_distribution?.[rating] as number) || 0;
        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

        return (
          <div key={rating} className="flex items-center gap-2">
            <div className="flex items-center gap-1 w-12">
              <span className="text-xs font-semibold">{rating}</span>
              <Star size={12} className="fill-[#D4AF37] text-[#D4AF37]" />
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#D4AF37] h-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 w-8 text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
};

export const Reviews: React.FC<ReviewsProps> = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewsResponse['data']['stats']>({
    average_rating: 0,
    total_reviews: 0,
    rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<'recent' | 'helpful' | 'rating'>('recent');
  const [showAddReview, setShowAddReview] = useState(false);

  const limit = 10;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reviewService.getProductReviews(productId, page, limit, sort);
      setReviews(response.data.reviews);
      
      // Ensure stats has default values
      const stats = response.data.stats || {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
      setStats(stats);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Set fallback stats on error
      setStats({
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    } finally {
      setLoading(false);
    }
  }, [productId, page, sort]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleMarkHelpful = async (reviewId: number, type: 'helpful' | 'unhelpful') => {
    try {
      const response = await reviewService.markHelpful(reviewId, type);
      setReviews(
        reviews.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                helpful_count: response.data.helpful_count,
                unhelpful_count: response.data.unhelpful_count,
              }
            : r
        )
      );
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mt-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#3E2723]">Customer Reviews</h3>
        {user && (
          <button
            onClick={() => setShowAddReview(!showAddReview)}
            className="text-sm px-4 py-2 bg-[#D4AF37] text-[#3E2723] font-semibold rounded-lg hover:bg-[#C9A227] transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Stats */}
      {stats && stats.total_reviews > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="flex items-start gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-[#3E2723]">
                  {(stats.average_rating || 0).toFixed(1)}
                </span>
                <span className="text-gray-600">/5</span>
              </div>
              <Stars rating={Math.round(stats.average_rating || 0)} />
              <p className="text-sm text-gray-600 mt-1">{stats.total_reviews || 0} reviews</p>
            </div>
          </div>

          {/* Distribution */}
          {stats.rating_distribution && <RatingDistribution stats={stats} />}
        </div>
      )}

      {/* Add Review Form */}
      {showAddReview && user && (
        <AddReviewForm
          productId={productId}
          onSuccess={() => {
            setShowAddReview(false);
            setPage(1);
            fetchReviews();
          }}
          onCancel={() => setShowAddReview(false)}
        />
      )}

      {/* Sort Options */}
      <div className="flex gap-3">
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as any);
            setPage(1);
          }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="rating">Highest Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
          </div>
        ) : reviews.length > 0 ? (
          <>
            <div className="space-y-0">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onHelpful={handleMarkHelpful}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-600 py-8">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
};

interface AddReviewFormProps {
  productId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const AddReviewForm: React.FC<AddReviewFormProps> = ({ productId, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (images.length + newFiles.length > 5) {
        setError('Maximum 5 images allowed');
        return;
      }
      setImages([...images, ...newFiles]);
      setError(null);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    try {
      await reviewService.createReview(productId, {
        rating,
        title,
        comment,
        images: images.length > 0 ? images : undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
      <h4 className="font-semibold text-[#3E2723] mb-4">Share Your Review</h4>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#3E2723] mb-2">Rating</label>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              className="focus:outline-none"
            >
              <Star
                size={24}
                className={i < rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-300'}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#3E2723] mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
          placeholder="Summary of your review"
        />
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#3E2723] mb-2">Comment (Optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={2000}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
          placeholder="Share more details about your experience..."
        />
      </div>

      {/* Images */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#3E2723] mb-2">
          Images (Optional, Max 5)
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          disabled={images.length >= 5}
          className="block w-full text-sm text-gray-500"
        />
        {images.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img
                  src={URL.createObjectURL(img)}
                  alt="preview"
                  className="w-20 h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-[#D4AF37] text-[#3E2723] font-semibold rounded-lg hover:bg-[#C9A227] transition-colors disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

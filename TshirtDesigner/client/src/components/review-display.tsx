import { useQuery } from "@tanstack/react-query";
import { StarRating } from "./star-rating";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { ShieldCheck, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  reviewText: string | null;
  isVerifiedPurchase: boolean;
  createdAt: string;
  user: {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
  };
}

interface ReviewDisplayProps {
  productId: string;
}

export function ReviewDisplay({ productId }: ReviewDisplayProps) {
  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/reviews`);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      return await response.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Customer Reviews</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Customer Reviews</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">Failed to load reviews</p>
        </CardContent>
      </Card>
    );
  }

  const averageRating = reviews && reviews.length > 0 
    ? reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingCounts = Array.from({ length: 5 }, (_, i) => {
    const rating = 5 - i;
    const count = reviews?.filter((review: Review) => review.rating === rating).length || 0;
    return { rating, count };
  });

  const totalReviews = reviews?.length || 0;

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Customer Reviews</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <StarRating value={averageRating} readonly size="lg" />
                <p className="text-sm text-gray-600 mt-2">
                  Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2">
              {ratingCounts.map(({ rating, count }) => (
                <div key={rating} className="flex items-center space-x-2">
                  <span className="text-sm w-2">{rating}</span>
                  <StarRating value={rating} readonly size="sm" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: totalReviews > 0 ? `${(count / totalReviews) * 100}%` : '0%'
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      {reviews && reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reviews.map((review: Review, index: number) => (
                <div key={review.id}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium">
                              {review.user.firstName && review.user.lastName
                                ? `${review.user.firstName} ${review.user.lastName}`
                                : review.user.username}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <StarRating value={review.rating} readonly size="sm" />
                              {review.isVerifiedPurchase && (
                                <Badge variant="secondary" className="text-xs">
                                  <ShieldCheck className="h-3 w-3 mr-1" />
                                  Verified Purchase
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </div>
                    </div>

                    {review.reviewText && (
                      <p className="text-gray-700 leading-relaxed">{review.reviewText}</p>
                    )}
                  </div>
                  {index < reviews.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Reviews Message */}
      {reviews && reviews.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-500">Be the first to review this product!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
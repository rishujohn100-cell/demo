import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StarRating } from "./star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  reviewText: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      toast.success("Review submitted successfully!");
      reset();
      setRating(0);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    createReviewMutation.mutate(data);
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setValue("rating", newRating);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Rating</Label>
            <div className="mt-2">
              <StarRating
                value={rating}
                onChange={handleRatingChange}
                size="lg"
              />
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive mt-1">{errors.rating.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="reviewText">Review (Optional)</Label>
            <Textarea
              id="reviewText"
              {...register("reviewText")}
              placeholder="Share your thoughts about this product..."
              className="mt-2"
              rows={4}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
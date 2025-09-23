import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Settings } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileUpdateData) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <p>Please log in to view your profile.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and personal information.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Summary */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarFallback className="text-lg">
                      {user.firstName && user.lastName
                        ? `${user.firstName[0]}${user.lastName[0]}`
                        : user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.username}
                  </CardTitle>
                  <CardDescription>@{user.username}</CardDescription>
                  <Badge variant="outline" className="w-fit mx-auto mt-2">
                    {user.role}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    {user.email}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>
                        Update your personal details and contact information.
                      </CardDescription>
                    </div>
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            First Name
                          </Label>
                          <p className="text-foreground">
                            {user.firstName || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Last Name
                          </Label>
                          <p className="text-foreground">
                            {user.lastName || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Email Address
                        </Label>
                        <p className="text-foreground">{user.email}</p>
                      </div>
                      <Separator />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Username
                        </Label>
                        <p className="text-foreground">{user.username}</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            {...form.register("firstName")}
                            placeholder="Enter your first name"
                          />
                          {form.formState.errors.firstName && (
                            <p className="text-sm text-destructive mt-1">
                              {form.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            {...form.register("lastName")}
                            placeholder="Enter your last name"
                          />
                          {form.formState.errors.lastName && (
                            <p className="text-sm text-destructive mt-1">
                              {form.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          {...form.register("email")}
                          placeholder="Enter your email address"
                        />
                        {form.formState.errors.email && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      <Separator />
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={updateProfileMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
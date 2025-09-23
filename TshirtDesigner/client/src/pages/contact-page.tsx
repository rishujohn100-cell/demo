import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin
} from 'lucide-react';
import { toast } from 'sonner';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  orderNumber: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate form submission - in real app, send to backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
      reset();
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'support@teedesignstudio.com',
      description: 'Send us an email anytime',
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+1 (555) 123-4567',
      description: 'Mon-Fri 9AM-6PM EST',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      content: '123 Design Avenue, Creative District, NY 10001',
      description: 'Our headquarters',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      content: 'Monday - Friday: 9AM - 6PM EST',
      description: 'Saturday: 10AM - 4PM EST',
    },
  ];

  const socialLinks = [
    {
      icon: Facebook,
      name: 'Facebook',
      url: 'https://facebook.com/teedesignstudio',
      color: 'text-blue-600',
    },
    {
      icon: Twitter,
      name: 'Twitter',
      url: 'https://twitter.com/teedesignstudio',
      color: 'text-sky-500',
    },
    {
      icon: Instagram,
      name: 'Instagram',
      url: 'https://instagram.com/teedesignstudio',
      color: 'text-pink-600',
    },
    {
      icon: Youtube,
      name: 'YouTube',
      url: 'https://youtube.com/teedesignstudio',
      color: 'text-red-600',
    },
    {
      icon: Linkedin,
      name: 'LinkedIn',
      url: 'https://linkedin.com/company/teedesignstudio',
      color: 'text-blue-700',
    },
  ];

  const faqItems = [
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days.',
    },
    {
      question: 'Can I track my order?',
      answer: 'Yes! Once your order ships, you\'ll receive a tracking number via email.',
    },
    {
      question: 'What\'s your return policy?',
      answer: 'We offer a 30-day return policy for unused items in original condition.',
    },
    {
      question: 'Do you offer bulk discounts?',
      answer: 'Yes, we offer special pricing for orders of 50+ items. Contact us for details.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4">
            Get In Touch
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions about your order, need design help, or want to collaborate? 
            We're here to help and would love to hear from you!
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="Enter your full name"
                        data-testid="input-contact-name"
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="Enter your email"
                        data-testid="input-contact-email"
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orderNumber">Order Number (Optional)</Label>
                    <Input
                      id="orderNumber"
                      {...register('orderNumber')}
                      placeholder="e.g., #12345 (if inquiry is about an existing order)"
                      data-testid="input-contact-order"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      {...register('subject')}
                      placeholder="What is this regarding?"
                      data-testid="input-contact-subject"
                    />
                    {errors.subject && (
                      <p className="text-sm text-destructive">{errors.subject.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      {...register('message')}
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      data-testid="textarea-contact-message"
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">{errors.message.message}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full"
                    data-testid="button-contact-submit"
                  >
                    {isSubmitting ? (
                      <>Sending Message...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information & Social */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Multiple ways to reach our team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <info.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{info.title}</h4>
                      <p className="text-sm font-medium">{info.content}</p>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Follow Us</CardTitle>
                <CardDescription>
                  Stay connected on social media
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                      data-testid={`link-social-${social.name.toLowerCase()}`}
                    >
                      <social.icon className={`h-5 w-5 ${social.color}`} />
                      <span className="font-medium text-sm">{social.name}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Quick Answers</CardTitle>
                <CardDescription>
                  Frequently asked questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqItems.map((faq, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-semibold text-sm">{faq.question}</h4>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    {index < faqItems.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  class: z.string().min(1, "Class is required"),
  roleNumber: z.string().min(1, "Role number is required"),
  photo: z.instanceof(File, { message: "Photo is required" }),
  position: z.enum(["batsman", "bowler", "all-rounder"], {
    required_error: "Please select a position",
  }),
  season1Team: z.enum([
    "mumbai-mavericks",
    "chennai-champions", 
    "kolkata-knights",
    "delhi-dynamos",
    "bangalore-blazers",
    "rajasthan-royals"
  ]).optional(),
  achievement: z.string().max(500, "Max 500 characters").optional(),
});

type FormData = z.infer<typeof formSchema>;

const teams = [
  { value: "mumbai-mavericks", label: "NAVGEKAR STRIKERS" },
  { value: "chennai-champions", label: "PATIL PANTHERS" },
  { value: "kolkata-knights", label: "JOSHI WARRIORS" },
  { value: "delhi-dynamos", label: "THE AURWADKARS" },
  { value: "bangalore-blazers", label: "GUPTE GLADIATORS" },
  { value: "rajasthan-royals", label: "BIRJE BLASTERS" },
];

const positions = [
  { value: "batsman", label: "Batsman" },
  { value: "bowler", label: "Bowler" },
  { value: "all-rounder", label: "All Rounder" },
];

interface RegistrationDialogProps {
  children: React.ReactNode;
}

export function RegistrationDialog({ children }: RegistrationDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      class: "",
      roleNumber: "",
      achievement: "",
    },
  });

  const compressImage = async (file: File, maxWidth = 1280, maxHeight = 1280, quality = 0.8): Promise<File> => {
    try {
      const img = document.createElement('img');
      const objectUrl = URL.createObjectURL(file);
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = objectUrl;
      });

      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      const targetW = Math.round(img.width * ratio);
      const targetH = Math.round(img.height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;
      ctx.drawImage(img, 0, 0, targetW, targetH);

      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      URL.revokeObjectURL(objectUrl);
      if (!blob) return file;
      return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
    } catch {
      return file;
    }
  };

  const onSubmit = async (data: FormData) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      console.log('Starting registration process with data:', {
        name: data.name,
        class: data.class,
        roleNumber: data.roleNumber,
        position: data.position,
        season1Team: data.season1Team,
        achievement: data.achievement,
        photoName: data.photo.name,
        photoSize: data.photo.size
      });

      // Compress photo to speed up upload
      const optimized = await compressImage(data.photo);
      const fileExt = optimized.name.split('.').pop();
      const fileName = `${data.name.replace(/\s/g, '_')}_${Date.now()}.${fileExt}`;
      
      console.log('Uploading photo with filename:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('player-photos')
        .upload(fileName, optimized, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Upload Error",
          description: `Failed to upload photo: ${uploadError.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Photo uploaded successfully:', uploadData);

      // Get public URL for the uploaded photo
      const { data: { publicUrl } } = supabase.storage
        .from('player-photos')
        .getPublicUrl(fileName);

      console.log('Generated public URL:', publicUrl);

      // Save registration data to database
      const registrationData = {
        name: data.name,
        class: data.class,
        role_number: data.roleNumber,
        photo_url: publicUrl,
        position: data.position,
        season1_team: data.season1Team || null,
        achievement: (data.achievement?.trim() || null) as string | null,
      };

      console.log('Saving registration data:', registrationData);

      const { data: inserted, error: dbError } = await supabase
        .from('player_registrations')
        .insert([registrationData])
        .select('auction_number, name')
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        toast({
          title: "Registration Error",
          description: `Failed to save registration: ${dbError.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Registration saved successfully', inserted);

      // Send registration data to external webhook (non-blocking)
      try {
        const formDataToSend = new FormData();
        formDataToSend.append('name', registrationData.name);
        formDataToSend.append('class', registrationData.class);
        formDataToSend.append('role_number', registrationData.role_number);
        formDataToSend.append('position', registrationData.position);
        if (registrationData.season1_team) formDataToSend.append('season1_team', registrationData.season1_team);
        if (registrationData.achievement ?? '') formDataToSend.append('achievement', registrationData.achievement as string);
        formDataToSend.append('photo_url', registrationData.photo_url || '');
        if (inserted?.auction_number !== undefined && inserted?.auction_number !== null) {
          formDataToSend.append('auction_number', String(inserted.auction_number));
        }
        formDataToSend.append('submitted_at', new Date().toISOString());
        // Attach the actual image file so the webhook receives it as a file
        formDataToSend.append('image', optimized, fileName);

        void fetch('https://hook.eu2.make.com/ty8uwnudxlvreaguotsv3wu97bz1whbo', {
          method: 'POST',
          body: formDataToSend,
        }).catch((e) => console.error('Webhook error:', e));
      } catch (e) {
        console.error('Failed to queue webhook:', e);
      }

      toast({
        title: "Registration Submitted!",
        description: inserted?.auction_number
          ? `Your Auction Number is ${inserted.auction_number}. We'll contact you soon!`
          : "Your registration has been submitted successfully. We'll contact you soon!",
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register for Sangharsh Season 2</DialogTitle>
          <DialogDescription>
            Fill in your details to register for the tournament. All fields are mandatory.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your class" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your role number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photo"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Photo *</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onChange(file);
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position.value} value={position.value}>
                          {position.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="season1Team"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Season 1 Team (optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team you played for in Season 1" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.value} value={team.value}>
                          {team.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="achievement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Achievement (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Mention notable cricket achievements (max 500 characters)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Register'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
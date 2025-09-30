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
  position: z.enum(["batsman", "bowler", "wicket-keeper"], {
    required_error: "Please select a position",
  }),
  season1Team: z.enum([
    "mumbai-mavericks",
    "chennai-champions", 
    "kolkata-knights",
    "delhi-dynamos",
    "bangalore-blazers",
    "rajasthan-royals"
  ], {
    required_error: "Please select a team from Season 1",
  }),
});

type FormData = z.infer<typeof formSchema>;

const teams = [
  { value: "mumbai-mavericks", label: "Navgekar Stickers" },
  { value: "chennai-champions", label: "Pathak Panthers" },
  { value: "kolkata-knights", label: "Joshi Warriors" },
  { value: "delhi-dynamos", label: "The Aurwadkars" },
  { value: "bangalore-blazers", label: "GUPTE GLADIATORS" },
  { value: "rajasthan-royals", label: "Brije Blasters" },
];

const positions = [
  { value: "batsman", label: "Batsman" },
  { value: "bowler", label: "Bowler" },
  { value: "wicket-keeper", label: "Wicket Keeper" },
];

interface RegistrationDialogProps {
  children: React.ReactNode;
}

export function RegistrationDialog({ children }: RegistrationDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      class: "",
      roleNumber: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      console.log('Starting registration process with data:', {
        name: data.name,
        class: data.class,
        roleNumber: data.roleNumber,
        position: data.position,
        season1Team: data.season1Team,
        photoName: data.photo.name,
        photoSize: data.photo.size
      });

      // Upload photo to storage
      const fileExt = data.photo.name.split('.').pop();
      const fileName = `${data.name.replace(/\s/g, '_')}_${Date.now()}.${fileExt}`;
      
      console.log('Uploading photo with filename:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('player-photos')
        .upload(fileName, data.photo);

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
        season1_team: data.season1Team,
      };

      console.log('Saving registration data:', registrationData);

      const { error: dbError } = await supabase
        .from('player_registrations')
        .insert([registrationData]);

      if (dbError) {
        console.error('Database error:', dbError);
        toast({
          title: "Registration Error",
          description: `Failed to save registration: ${dbError.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Registration saved successfully');

      toast({
        title: "Registration Submitted!",
        description: "Your registration has been submitted successfully. We'll contact you soon!",
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
                  <FormLabel>Season 1 Team *</FormLabel>
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

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Register
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
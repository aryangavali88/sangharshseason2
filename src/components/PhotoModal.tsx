import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PhotoModalProps {
  photo: {
    id: string;
    url: string;
    caption: string;
    category: string;
  };
  children: React.ReactNode;
}

const PhotoModal = ({ photo, children }: PhotoModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 overflow-hidden">
        <div className="relative">
          <img 
            src={photo.url} 
            alt={photo.caption}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h3 className="text-xl font-semibold text-white mb-2">{photo.caption}</h3>
            <Badge variant="secondary" className="bg-white/20 text-white">
              {photo.category}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoModal;
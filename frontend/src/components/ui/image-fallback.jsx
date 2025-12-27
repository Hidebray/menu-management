import { useState } from 'react';
import { Utensils } from 'lucide-react'; // Icon cái đĩa/nĩa
import { cn } from '../../lib/utils';

export default function ImageWithFallback({ src, alt, className, ...props }) {
  const [error, setError] = useState(false);

  // Nếu không có src hoặc đã xảy ra lỗi load ảnh -> Hiện hộp màu xám + Icon
  if (!src || error) {
    return (
      <div className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}>
        <Utensils className="w-1/3 h-1/3 opacity-20" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)} // Khi lỗi xảy ra, set state error = true
      {...props}
    />
  );
}
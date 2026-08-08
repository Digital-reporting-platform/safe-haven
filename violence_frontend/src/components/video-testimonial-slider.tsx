import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Quote,
  CheckCircle,
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  image: string;
  quote: string;
  videoThumbnail: string;
  stats: {
    label: string;
    value: string;
  }[];
}

export function VideoTestimonialSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah M.',
      role: 'Survivor & Advocate',
      location: 'Boston, MA',
      image:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      quote:
        'SafeHaven gave me the courage to speak up. Within 48 hours, I was connected with a counselor who understood my situation. The anonymous reporting system made me feel safe enough to take that first step.',
      videoThumbnail:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      stats: [
        { label: 'Days to Support', value: '2' },
        { label: 'Success Rate', value: '98%' },
      ],
    },
    {
      id: 2,
      name: 'Michael K.',
      role: 'Recovery Advocate',
      location: 'Seattle, WA',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      quote:
        "The platform's anonymity protected me when I needed it most. I was able to access legal support and counseling without fear. Today, I'm helping others through their recovery journey thanks to SafeHaven's professional network.",
      videoThumbnail:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      stats: [
        { label: 'Professionals Connected', value: '5' },
        { label: 'Recovery Time', value: '3 mo' },
      ],
    },
    {
      id: 3,
      name: 'Emily R.',
      role: 'Community Leader',
      location: 'Austin, TX',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      quote:
        "I was skeptical about online platforms, but SafeHaven exceeded all expectations. The real-time tracking, verified professionals, and comprehensive resources gave me hope. Now I'm thriving and helping others find their voice.",
      videoThumbnail:
        'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      stats: [
        { label: 'Community Members', value: '200+' },
        { label: 'Support Sessions', value: '50+' },
      ],
    },
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const currentTestimonial = testimonials[currentSlide];

  return (
    <div className="relative">
      {/* Main Slider */}
      <div className="relative overflow-hidden rounded-3xl">
        <Card className="overflow-hidden border border-0 border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-5">
              {/* Video/Image Section */}
              <div className="group relative lg:col-span-3">
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                  <ImageWithFallback
                    src={currentTestimonial.videoThumbnail}
                    alt={currentTestimonial.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/50">
                    <button className="group flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-2xl backdrop-blur-sm transition-all hover:scale-110">
                      <Play
                        className="ml-1 h-10 w-10 text-blue-600"
                        fill="currentColor"
                      />
                    </button>
                  </div>

                  {/* Verified Badge */}
                  <div className="absolute top-6 left-6 flex items-center gap-2 rounded-full bg-emerald-500/90 px-4 py-2 backdrop-blur-sm">
                    <CheckCircle className="h-4 w-4 text-white" />
                    <span
                      className="text-sm text-white"
                      style={{ fontWeight: 600 }}
                    >
                      Verified Story
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex flex-col justify-between p-8 lg:col-span-2 lg:p-10">
                <div>
                  {/* Quote Icon */}
                  <Quote className="mb-6 h-10 w-10 text-blue-400" />

                  {/* Testimonial Text */}
                  <p className="mb-8 text-lg leading-relaxed text-white">
                    "{currentTestimonial.quote}"
                  </p>
                </div>

                {/* Author Info */}
                <div>
                  <div className="mb-6 flex items-center gap-4">
                    <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-white/30">
                      <ImageWithFallback
                        src={currentTestimonial.image}
                        alt={currentTestimonial.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div
                        className="mb-1 text-white"
                        style={{ fontWeight: 600 }}
                      >
                        {currentTestimonial.name}
                      </div>
                      <div className="text-sm text-blue-200">
                        {currentTestimonial.role}
                      </div>
                      <div className="text-xs text-blue-300">
                        {currentTestimonial.location}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    {currentTestimonial.stats.map((stat, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                      >
                        <div
                          className="mb-1 text-2xl text-white"
                          style={{ fontWeight: 700 }}
                        >
                          {stat.value}
                        </div>
                        <div className="text-xs text-blue-200">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-xl backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
        >
          <ChevronLeft className="h-6 w-6 text-slate-900" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-xl backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
        >
          <ChevronRight className="h-6 w-6 text-slate-900" />
        </button>
      </div>

      {/* Slider Indicators */}
      <div className="mt-6 flex items-center justify-center gap-3">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'w-12 bg-white'
                : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Floating Stats Card */}
      <div className="animate-float absolute -bottom-8 left-8 hidden rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-2xl lg:block">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <CheckCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Success Stories</div>
            <div
              className="text-2xl text-slate-900"
              style={{ fontWeight: 700 }}
            >
              10,000+
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

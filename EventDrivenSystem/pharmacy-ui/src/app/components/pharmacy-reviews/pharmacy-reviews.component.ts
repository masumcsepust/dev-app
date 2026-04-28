import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface DoctorReview {
  name: string;
  title: string;
  specialty: string;
  hospital: string;
  avatar: string;
  rating: number;
  review: string;
  reviewBn: string;
  verified: boolean;
}

export interface PatientTestimonial {
  name: string;
  location: string;
  rating: number;
  comment: string;
  commentBn: string;
  date: string;
  avatar: string;
}

@Component({
  selector: 'app-pharmacy-reviews',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pharmacy-reviews.component.html',
  styleUrl: './pharmacy-reviews.component.css'
})
export class PharmacyReviewsComponent {
  lang: 'en' | 'bn' = 'en';

  stats = [
    { value: '15,000+', label: 'Happy Patients', labelBn: 'সন্তুষ্ট রোগী', icon: '👨‍👩‍👧‍👦' },
    { value: '80+',     label: 'Expert Doctors', labelBn: 'বিশেষজ্ঞ চিকিৎসক', icon: '🩺' },
    { value: '4.9 ★',  label: 'Average Rating', labelBn: 'গড় রেটিং', icon: '⭐' },
    { value: '99%',    label: 'Genuine Medicines', labelBn: 'খাঁটি ওষুধ', icon: '💊' },
  ];

  doctors: DoctorReview[] = [
    {
      name: 'Dr. Sarah Ahmed',
      title: 'MBBS, MD (Cardiology)',
      specialty: 'Cardiologist',
      hospital: 'Dhaka Medical College Hospital',
      avatar: '👩‍⚕️',
      rating: 5,
      review: 'PharmaStore consistently provides genuine, verified medicines with proper cold-chain storage. I confidently refer all my cardiac patients here knowing they\'ll receive authentic medications on time.',
      reviewBn: 'PharmaStore সবসময় খাঁটি, যাচাইকৃত ওষুধ সঠিক সংরক্ষণ পদ্ধতিতে সরবরাহ করে। আমি আত্মবিশ্বাসের সাথে আমার সকল হৃদরোগীকে এখানে পাঠাই।',
      verified: true,
    },
    {
      name: 'Dr. Rahman Khan',
      title: 'MBBS, FCPS (Medicine)',
      specialty: 'General Physician',
      hospital: 'Chittagong General Hospital',
      avatar: '👨‍⚕️',
      rating: 5,
      review: 'The prescription management system is outstanding. My patients submit prescriptions digitally, I get notified, and medicines are delivered within hours. This is the future of healthcare.',
      reviewBn: 'প্রেসক্রিপশন ম্যানেজমেন্ট সিস্টেম অসাধারণ। রোগীরা ডিজিটালি প্রেসক্রিপশন দেয়, আমি নোটিফিকেশন পাই এবং কয়েক ঘণ্টার মধ্যে ওষুধ পৌঁছে যায়।',
      verified: true,
    },
    {
      name: 'Dr. Priya Das',
      title: 'MBBS, DCH (Paediatrics)',
      specialty: 'Paediatrician',
      hospital: 'Bangladesh Children\'s Hospital',
      avatar: '👩‍⚕️',
      rating: 5,
      review: 'The AI assistant on PharmaStore is impressively accurate for patient education. Parents come informed with the right questions. Stock availability is always reliable for paediatric dosages.',
      reviewBn: 'PharmaStore-এর AI সহকারী রোগী শিক্ষার জন্য চমৎকারভাবে নির্ভুল। অভিভাবকরা সঠিক প্রশ্ন নিয়ে আসেন। শিশু ডোজের জন্য স্টক সবসময় নির্ভরযোগ্য।',
      verified: true,
    },
    {
      name: 'Dr. Arif Hossain',
      title: 'MBBS, MS (Orthopaedics)',
      specialty: 'Orthopaedic Surgeon',
      hospital: 'National Orthopaedic Hospital, Dhaka',
      avatar: '👨‍⚕️',
      rating: 5,
      review: 'Post-surgery medication compliance has improved significantly among my patients since they started using PharmaStore. The reminder features and easy reordering make recovery much smoother.',
      reviewBn: 'PharmaStore ব্যবহার শুরুর পর থেকে অস্ত্রোপচার পরবর্তী ওষুধ মানা উল্লেখযোগ্যভাবে উন্নত হয়েছে। সহজ রিঅর্ডার সুবিধা সুস্থতাকে আরও মসৃণ করে।',
      verified: true,
    },
    {
      name: 'Dr. Nasrin Begum',
      title: 'MBBS, MD (Gynaecology)',
      specialty: 'Gynaecologist & Obstetrician',
      hospital: 'Square Hospital, Dhaka',
      avatar: '👩‍⚕️',
      rating: 5,
      review: 'For my pregnant patients, medicine authenticity is non-negotiable. PharmaStore\'s strict quality control and discreet doorstep delivery has made it my top recommendation for years.',
      reviewBn: 'আমার গর্ভবতী রোগীদের জন্য ওষুধের খাঁটিত্ব আপোষহীন। PharmaStore-এর কঠোর মান নিয়ন্ত্রণ এবং বিনীত হোম ডেলিভারি আমাকে বছরের পর বছর ধরে এটি সুপারিশ করতে অনুপ্রাণিত করে।',
      verified: true,
    },
    {
      name: 'Dr. Kabir Ahmed',
      title: 'MBBS, MRCP (UK), Neurology',
      specialty: 'Neurologist',
      hospital: 'BIRDEM General Hospital',
      avatar: '👨‍⚕️',
      rating: 5,
      review: 'Neurological medications require precise dosing and genuine formulations. PharmaStore has never let my patients down. The pharmacist team is knowledgeable and always available.',
      reviewBn: 'স্নায়বিক ওষুধে সঠিক ডোজ এবং খাঁটি ফর্মুলেশন প্রয়োজন। PharmaStore কখনো আমার রোগীদের হতাশ করেনি। ফার্মাসিস্ট দল জ্ঞানী এবং সর্বদা উপলব্ধ।',
      verified: true,
    },
  ];

  testimonials: PatientTestimonial[] = [
    { name: 'Rahim Uddin', location: 'Dhaka', rating: 5, date: 'March 2025', avatar: '👨',
      comment: 'Ordered my father\'s blood pressure medicines at midnight and they were delivered by 9am. Exceptional service!',
      commentBn: 'মধ্যরাতে বাবার রক্তচাপের ওষুধ অর্ডার করেছিলাম, সকাল ৯টায় পৌঁছে গেল। অসাধারণ সেবা!' },
    { name: 'Sumaiya Khatun', location: 'Chittagong', rating: 5, date: 'February 2025', avatar: '👩',
      comment: 'The prescription upload feature saved me so much hassle. Submitted online, got approved and delivered same day.',
      commentBn: 'প্রেসক্রিপশন আপলোড ফিচার আমার অনেক ঝামেলা বাঁচিয়েছে। অনলাইনে জমা দিলাম, একই দিনে অনুমোদন ও ডেলিভারি পেলাম।' },
    { name: 'Tanvir Islam', location: 'Sylhet', rating: 5, date: 'January 2025', avatar: '👨',
      comment: 'PharmaAI told me exactly which medicines interact with my existing prescription. Very helpful and accurate!',
      commentBn: 'PharmaAI আমাকে বলল কোন ওষুধগুলো আমার বিদ্যমান প্রেসক্রিপশনের সাথে মিথস্ক্রিয়া করে। খুবই সহায়ক এবং নির্ভুল!' },
    { name: 'Fatema Begum', location: 'Rajshahi', rating: 5, date: 'March 2025', avatar: '👩',
      comment: 'Genuine medicines at fair prices. I compared with three other pharmacies — PharmaStore won every time.',
      commentBn: 'ন্যায্য মূল্যে খাঁটি ওষুধ। তিনটি ফার্মেসির সাথে তুলনা করেছি — PharmaStore সবসময় জিতেছে।' },
    { name: 'Mohammad Ali', location: 'Khulna', rating: 4, date: 'April 2025', avatar: '👨',
      comment: 'Great variety of medicines. The search and filter make it easy to find what I need. Delivery is fast.',
      commentBn: 'ওষুধের দারুণ বৈচিত্র্য। সার্চ ও ফিল্টার দরকারী জিনিস খুঁজে পেতে সহজ করে। ডেলিভারি দ্রুত।' },
    { name: 'Nusrat Jahan', location: 'Comilla', rating: 5, date: 'February 2025', avatar: '👩',
      comment: 'As a nurse I was sceptical at first, but the medicine quality and cold-chain compliance impressed me. Highly recommended.',
      commentBn: 'নার্স হিসেবে প্রথমে সংশয়ী ছিলাম, কিন্তু ওষুধের মান এবং কোল্ড চেইন মান্য আমাকে মুগ্ধ করেছে। অত্যন্ত প্রস্তাবিত।' },
  ];

  stars(n: number): number[] { return Array(n).fill(0); }
  emptyStars(n: number): number[] { return Array(5 - n).fill(0); }
}

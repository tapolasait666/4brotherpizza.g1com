import { Link } from 'react-router-dom';
import { Pizza } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-yellow/30 bg-brand-yellow/10 text-brand-yellow">
          <Pizza size={30} />
        </span>
        <h1 className="mt-4 font-heading text-4xl font-extrabold uppercase text-white">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          That slice doesn't exist. Let's get you back to the menu.
        </p>
        <Link to="/" className="btn btn-primary mt-5">
          Back to home
        </Link>
      </div>
    </div>
  );
}

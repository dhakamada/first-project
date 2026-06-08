const COLORS = {
  Food: 'bg-green-100 text-green-800',
  Transport: 'bg-blue-100 text-blue-800',
  Housing: 'bg-amber-100 text-amber-800',
  Entertainment: 'bg-purple-100 text-purple-800',
  Health: 'bg-red-100 text-red-800',
  Other: 'bg-gray-100 text-gray-700',
};

export default function CategoryBadge({ category }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${COLORS[category] || COLORS.Other}`}>
      {category}
    </span>
  );
}

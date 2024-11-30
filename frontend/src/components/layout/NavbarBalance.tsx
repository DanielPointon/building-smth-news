export const NavbarBalance: React.FC<Balance> = ({ currency, amount, icon: Icon }) => {
  const colorClass = currency === 'PRC' ? 'text-yellow-500' : 'text-green-500';
  
  return (
    <div className="flex items-center gap-2">
      <Icon className={colorClass} size={20} />
      <span className="text-white">
        {amount} {currency}
      </span>
    </div>
  );
};
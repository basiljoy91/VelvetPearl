import monogram from '../../assets/branding/velvet-pearl/velvet-pearl-monogram-transparent.png';

export default function BrandMark({
  className = '',
  logoClassName = 'h-10 w-10',
  title = 'Velvet Pearl',
  titleClassName = '',
  caption,
  captionClassName = '',
  mobileMonogramOnly = false,
  priority = false,
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        alt="Velvet Pearl logo"
        className={`h-auto shrink-0 object-contain ${logoClassName}`}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        loading={priority ? 'eager' : 'lazy'}
        src={monogram}
      />

      <div className={`${mobileMonogramOnly ? 'hidden sm:flex' : 'flex'} min-w-0 flex-col`}>
        <span className={`truncate font-headline font-bold tracking-tight text-white ${titleClassName}`}>
          {title}
        </span>
        {caption ? (
          <span className={`truncate text-xs text-gray-400 ${captionClassName}`}>
            {caption}
          </span>
        ) : null}
      </div>
    </div>
  );
}

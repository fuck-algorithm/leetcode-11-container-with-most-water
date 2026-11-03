import { useState } from 'react';

export function CommunityFloat() {
  const [open, setOpen] = useState(false);
  return (
    <div className="community-float" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="community-button" aria-expanded={open}>交流群</button>
      {open && <div className="community-popover"><img src={`${import.meta.env.BASE_URL}assets/qrcode-community.png`} alt="算法交流群二维码" /><p>扫码发送 leetcode 加入交流群</p></div>}
    </div>
  );
}

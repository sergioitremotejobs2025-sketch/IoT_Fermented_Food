import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [],
  template: `
    <div class="skeleton-box pulse" 
         [style.width]="width()" 
         [style.height]="height()" 
         [style.border-radius]="computedBorderRadius()">
    </div>
  `,
  styles: [`
    .skeleton-box {
      background-color: rgba(0, 0, 0, 0.08);
      display: inline-block;
    }

    [theme="dark"] .skeleton-box {
      background-color: rgba(255, 255, 255, 0.08);
    }

    .pulse {
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
  `]
})
export class SkeletonComponent {
  width = input('100%');
  height = input('20px');
  borderRadius = input('4px');
  variant = input<'rect' | 'circle'>('rect');

  computedBorderRadius = computed(() => {
    return this.variant() === 'circle' ? '50%' : this.borderRadius();
  });
}

import { Directive, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appAppear]',
})
export class AppearDirective {

  @Input() appAppearId: unknown;
  @Output() appAppear = new EventEmitter<void>();

  ngOnChanges({ appAppearId }: SimpleChanges): void {
    if (appAppearId.currentValue !== appAppearId.previousValue && !appAppearId.firstChange) {
      this.appAppear.emit();
    }
  }

  ngOnInit(): void {
    this.appAppear.emit();
  }

}

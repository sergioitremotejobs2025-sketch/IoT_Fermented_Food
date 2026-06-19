import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexComponent } from './index.component';
import { TestModule } from '@modules/test.module';

describe('IndexComponent', () => {
  let component: IndexComponent;
  let fixture: ComponentFixture<IndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IndexComponent],
      imports: [TestModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle showBtn1 on mouse events', () => {
    const card = fixture.debugElement.nativeElement.querySelector('mat-card');
    card.dispatchEvent(new Event('mouseenter'));
    expect(component.showBtn1).toBeTrue();

    card.dispatchEvent(new Event('mouseleave'));
    expect(component.showBtn1).toBeFalse();
  });
});

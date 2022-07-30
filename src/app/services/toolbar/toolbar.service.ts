import { Injectable, NgZone } from '@angular/core';
import { asyncScheduler, BehaviorSubject, Observable, scheduled } from 'rxjs';
import { APIPlatform } from '../api/models/api-platform.enum';
import { ToolbarState } from './models/toolbar-state.interface';

@Injectable({
  providedIn: 'root',
})
export class ToolbarService {

  private readonly state$ = new BehaviorSubject<ToolbarState>({ platformColor: null, title: '' });

  getStateChanges(): Observable<ToolbarState> {
    return scheduled(this.state$.asObservable(), asyncScheduler);
  }

  setPlatform(platform: APIPlatform | null): void {
    const platformToColor: Record<APIPlatform, string> = {
      [APIPlatform.WB]: '#cb11ab',
    };
    const platformColor = platform ? (platformToColor[platform] ?? null) : null;
    const newState: ToolbarState = {
      ...this.state$.getValue(),
      platformColor,
    };
    this.state$.next(newState);
  }

  setTitle(title: string): void {
    const newState: ToolbarState = {
      ...this.state$.getValue(),
      title,
    };
    this.state$.next(newState);
  }

}

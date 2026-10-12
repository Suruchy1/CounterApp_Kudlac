
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSpinner,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
} from '@ionic/angular';
import { CounterService } from '../services/counter.service';

type HistoryFilter = 'all' | 'positive' | 'negative';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    DatePipe,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSpinner,
    IonTitle,
    IonToolbar,
    IonSegment,
    IonSegmentButton,
  ],
})
export class Tab2Page implements OnInit {
  readonly counterService = inject(CounterService);

  readonly filter = signal<HistoryFilter>('all');

  readonly filteredCounters = computed(() => {
    const counters = this.counterService.counters();

    switch (this.filter()) {
      case 'positive':
        return counters.filter(counter => counter.value > 0);

      case 'negative':
        return counters.filter(counter => counter.value < 0);

      default:
        return counters;
    }
  });

  setFilter(value: string | number | undefined | null): void {
    if (value === 'all' || value === 'positive' || value === 'negative') {
      this.filter.set(value);
    }
  }

  async ngOnInit(): Promise<void> {
    await this.counterService.initialize();
  }

  async remove(id: string): Promise<void> {
    await this.counterService.remove(id);
  }

  async clear(): Promise<void> {
    await this.counterService.clear();
  }
}

import { Component, OnDestroy, OnInit} from '@angular/core'; //
import { Observable, of, Subscription } from 'rxjs'; //
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Router } from '@angular/router';  //
import { Olympic } from 'src/app/core/models/Olympic'; //

// interface qui contiennent les données a affiché par ngxcharts
interface chartDataModel{
        name: string;         // nom du pays
        value: number;         // Valeur (nombre de médailles)
        extra: { id: number };
}

//  Interface pour le tooltip (structure des données reçues par ngx-charts)
interface tooltipData {
  data: chartDataModel;  // Les données de l'élément
  value: number;         // La valeur affichée
  name: string;          // Le nom affiché
}

//  Interface pour les événements ngx-charts
interface chartEvent {
  name: string;
  value: number;
  label?: string;
  extra?: { id: number };
}


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit,OnDestroy {
   
  chartData: chartDataModel[] = []; //  Données pour le graphique
  
  view: [number,number] = [700, 400];
  gradient: boolean = true;
  showLegend: boolean = false;
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  tooltipDisabled: boolean = false; 
  legendPosition: string = 'below';

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA', '#7aa3e5']
  };


  public olympics$: Observable<Olympic[] | null> = of(null);
  
  numberOfJOs: number = 0;
  numberOfCountries: number = 0;

   // Subscription
  private subscription!: Subscription;

    constructor(
    private olympicService: OlympicService,
    private router: Router
  ) {}



  ngOnInit(): void {
    this.olympics$ = this.olympicService.getOlympics();
    this.subscription = this.olympics$.subscribe({next: data => {
        if(data){
          this.numberOfCountries = data.length;
            this.prepareChartData(data);
            this.calculateNumberOfJOs(data);
        }
      }
    });
  }

  



  

  /**
   * Calcule le nombre total de JO (années uniques)
   */
 private calculateNumberOfJOs(olympics: Olympic[]): void {
    const uniqueYears = new Set<number>();
    olympics.forEach(olympic => {olympic.participations.forEach(participation => {uniqueYears.add(participation.year);});
    });
    this.numberOfJOs = uniqueYears.size;
  }

  /**
   * Prépare les données pour le Pie Chart
   * Transforme les données Olympic[] en format attendu par ngx-charts
   */
  private prepareChartData(olympics: Olympic[]): void {
    this.chartData = olympics.map(olympic => {
      // Calcul du total de médailles pour ce pays
      const totalMedals = olympic.participations.reduce((somme, participation) => somme + participation.medalsCount,0);

      return {
        name: olympic.country,      // Nom affiché sur le graphique
        value: totalMedals,          // Valeur (nombre de médailles)
        extra: { id: olympic.id }    // Données supplémentaires pour la navigation
      };
    });
  }



pieTooltipText = (TooltipData: tooltipData): string => {
  const name = TooltipData.data.name;   // structure data retourné par ngxcharts
  const value = TooltipData.value;      
  return `${name}\n🏅 ${value}`;
}



  onSelect(event: chartEvent): void {
  if (event.extra && event.extra.id) {
    this.router.navigate(['/detail', event.extra.id]);  // permet de faire la Navigation lorsqu'on change de page !
  }}



  /**
   * Gestion du survol d'une portion
   */
  onActivate(event: chartEvent): void {
    console.log('Activate', JSON.parse(JSON.stringify(event)));
  }

  /**
   * Gestion de la fin du survol
   */
  onDeactivate(event: chartEvent): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(event)));
  }

  ngOnDestroy(): void { // ne pas oublier le implements OnDestroy
    this.subscription?.unsubscribe();
   
  }

}


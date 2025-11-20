// src/app/pages/detail/detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subscription} from 'rxjs';
import { Olympic } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';


interface Series{
  name: string;
  value: number;

}

interface lineCharDataModel{
  name: string;
  series: Series[];

}

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit, OnDestroy {
  // Données du pays
  countryName: string = '';
  olympic: Olympic | undefined;

  // Statistiques
  numberOfEntries: number = 0;
  totalMedals: number = 0;
  totalAthletes: number = 0;

  // Données pour le graphique en ligne
  lineChartData: lineCharDataModel[] = [];

  // Options du graphique
  view: [number,number] = [1000, 400];
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = false;
  showLegend: boolean = false;
  showXAxisLabel: boolean = true;
  showYAxisLabel: boolean = false;
  xAxisLabel: string = 'Dates';
  yAxisLabel: string = '';
  timeline: boolean = false;
  
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA', '#7aa3e5']
  };

  private subscription!: Subscription;
  public olympics$: Observable<Olympic[] | null> = of(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private olympicService: OlympicService
  ) {}

  ngOnInit(): void {
    // Récupération de l'ID depuis l'URL
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    //chargement des données
    this.olympics$ = this.olympicService.getOlympics();
    this.subscription = this.olympics$.subscribe({
      next: data => {
        if(data){
          this.olympic = data.find(elementInData => elementInData.id === id);
          if (this.olympic) {
            this.loadCountryData(this.olympic);
          } else {
            // Pays non trouvé, redirection vers 404
            this.router.navigate(['/404']);
          }
        }
      }
    });

    
  }

  /**
   * Charge les données d'un pays et prépare le graphique
   */
  private loadCountryData(olympic: Olympic): void {
    this.countryName = olympic.country;
    this.numberOfEntries = olympic.participations.length;
    
    // Calcul du total de médailles
    this.totalMedals = olympic.participations.reduce((somme, p) => somme + p.medalsCount,0);
    
    // Calcul du total d'athlètes
    this.totalAthletes = olympic.participations.reduce((somme, p) => somme + p.athleteCount,0);

    // Préparation des données pour le graphique en ligne
    this.prepareLineChartData(olympic);
  }

  /**
   * Prépare les données pour le graphique en ligne
   * Format attendu par ngx-charts-line-chart
   */
  private prepareLineChartData(olympic: Olympic): void {
    this.lineChartData = [
      {
        name: olympic.country,
        series: olympic.participations.map(participation => ({
          name: participation.year.toString(),
          value: participation.medalsCount
        }))
      }
    ];
  }

  /**
   * Retour à la page d'accueil
   */
  goBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Gestion du clic sur le graphique (optionnel)
   */
  onSelect(event: {name: string;value: number}): void {
    console.log('Item clicked', event);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
   
  }
}
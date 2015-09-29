/// <reference path="_all.ts" />
'use strict';

import {ServantModel, SkillModel, StatusModel, DeckModel, PrizeModel} from './models';

export class ServantService {
  private static url: string = './api/servants/';
  public servants: ServantModel[] = [];

  public static $inject = [
    '$http',
    '$q'
  ];

  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService
  ) {
  }

  public load(): ng.IPromise<any> {
    let deferrd = this.$q.defer();
    if (this.servants.length) {
      deferrd.resolve();
      return deferrd.promise;
    }
    this.$http.get(ServantService.url)
      .then((res: any) => {
        res.data.forEach((servant: any) => {
          this.servants.push(new ServantModel(servant));
        });
        deferrd.resolve();
      }, () => {
        deferrd.reject();
      });
    return deferrd.promise;
  }

  public getServantWithId(id: number): ServantModel {
    let result: ServantModel = null;
    this.servants.forEach((servant) => {
      if (servant.id == id) {
        result = servant;
      }
    });
    return result;
  }
}

export class DeckService {
  public servants: ServantModel[] = [];
  public deck: DeckModel;

  public get url(): string {
    let a = this.$window.document.createElement('a');
    a.href = this.$window.location.href;
    return a.protocol + '//'
      + a.hostname + (a.port ? ':' + a.port : a.port)
      + '/deck/' + this.deck.hash + '/';
  }

  public static $inject = [
    '$window'
  ];

  constructor(
    private $window: ng.IWindowService
  ) {
    this.deck = new DeckModel();
  }

  public loadWithHash(hash: string): void {
    this.deck.hash = hash;
    this.deck.updateServants(this.servants);
  }

  public setServant(index: number, servantId: number): void {
    this.deck.servantIds[index] = servantId;
    this.deck.updateServants(this.servants);
  }

  public unsetServant(index: number): void {
    this.setServant(index, undefined);
  }
}

export class PrizeService {
  private static url: string = './api/prizes/';
  public prizes: PrizeModel[] = [];

  public static $inject = [
    '$http',
    '$q'
  ];

  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService
  ) {
  }

  public load(): ng.IPromise<any> {
    let deferrd = this.$q.defer();
    if (this.prizes.length) {
      deferrd.resolve();
      return deferrd.promise;
    }
    this.$http.get(PrizeService.url)
      .then((res: any) => {
        res.data.forEach((prize: any) => {
          this.prizes.push(new PrizeModel(prize));
        });
        deferrd.resolve();
      }, () => {
        deferrd.reject();
      });
    return deferrd.promise;
  }
}

export class ScrollService {
  private positions: { [index: string]: number; } = {};

  public static $inject = [
    '$location',
    '$window'
  ];

  constructor(
    private $location: ng.ILocationService,
    private $window: ng.IWindowService
  ) {
    angular.element($window).on('scroll', () => {
      this.positions[this.$location.path()] = angular.element($window).scrollTop();
    });
  }

  public restore(): void {
    let top = this.positions[this.$location.path()] || 0;
    angular.element(this.$window).scrollTop(top);
  }
}

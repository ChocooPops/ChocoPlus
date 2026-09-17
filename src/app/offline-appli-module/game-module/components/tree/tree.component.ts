import { Component, Renderer2, Input } from '@angular/core';
import { AbstractElementComponent } from '../abstract-element.component';
import { SpriteModel } from '../../models/sprite.interface';
import { TreeService } from '../../services/tree/tree.service';

@Component({
  selector: 'app-tree',
  standalone: true,
  imports: [],
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css', '../../style/scroll.css']
})
export class TreeComponent extends AbstractElementComponent {

  @Input() type: boolean = true;
  public tree !: SpriteModel;

  constructor(private treeService: TreeService,
    render: Renderer2
  ) {
    super(render)
  }

  ngAfterViewInit(): void {
    this.initializeTree();
  }

  override ngOnInit(): void {
    this.initIteration(2);
    this.initializeTree();
  }

  private initializeTree(): void {
    if (this.type) {
      this.subscription.add(
        this.treeService.getBlueTreeSprite().getSprite().subscribe((sprite) => {
          this.tree = sprite;
          this.setAnimationScrolling(this.tree);
        })
      )
    } else {
      this.subscription.add(
        this.treeService.getYellowTreeSprite().getSprite().subscribe((sprite) => {
          this.tree = sprite;
          this.setAnimationScrolling(this.tree);
        })
      )
    }
  }

}

'use client';

import { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  FilterX,
  GamepadIcon,
  MoreHorizontal,
  Star,
  Zap,
  TrendingUp,
  Eye,
  ExternalLink,
  AlertCircle,
  Upload
} from 'lucide-react';
import { useGames } from '@/hooks/queries/useGames';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';

export default function AdminGamesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isGameDialogOpen, setIsGameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    developerName: '',
    publisherName: '',
    isFeatured: false,
    isPopular: false,
    isNew: false,
  });

  // Fetch games with filters
  const { 
    data, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useGames({
    search: searchQuery,
    featured: filterType === 'featured',
    popular: filterType === 'popular',
    isNew: filterType === 'new',
  });

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // If the name field is being changed, auto-generate the slug
    if (name === 'name' && !selectedGame) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        slug: generateSlug(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  // Handle switch toggle
  const handleSwitchChange = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Open create game dialog
  const openCreateDialog = () => {
    setSelectedGame(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      developerName: '',
      publisherName: '',
      isFeatured: false,
      isPopular: false,
      isNew: false,
    });
    setIsGameDialogOpen(true);
  };

  // Open edit game dialog
  const openEditDialog = (game) => {
    setSelectedGame(game);
    setFormData({
      id: game.id,
      name: game.name || '',
      slug: game.slug || '',
      description: game.description || '',
      shortDescription: game.shortDescription || '',
      developerName: game.developerName || '',
      publisherName: game.publisherName || '',
      isFeatured: game.isFeatured || false,
      isPopular: game.isPopular || false,
      isNew: game.isNew || false,
    });
    setIsGameDialogOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (game) => {
    setSelectedGame(game);
    setIsDeleteDialogOpen(true);
  };

  // Submit form handler
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Here you would typically call an API to create/update a game
    // For now we'll just show a toast
    
    toast.success(selectedGame ? "Game updated successfully" : "Game created successfully");
    setIsGameDialogOpen(false);
    
    // In a real implementation, you'd refetch after successful API call
    // refetch();
  };

  // Delete game handler
  const handleDeleteGame = () => {
    // Here you would typically call an API to delete a game
    // For now we'll just show a toast
    
    toast.success("Game deleted successfully");
    setIsDeleteDialogOpen(false);
    
    // In a real implementation, you'd refetch after successful API call
    // refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Game Management</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Game
        </Button>
      </div>

      <Card className="border-border/40">
        <CardContent className="p-6">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search games..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter games" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                </SelectContent>
              </Select>
              {(searchQuery || filterType !== 'all') && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                  }}
                >
                  <FilterX className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Games Table */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-6 text-destructive">
              <p>Error loading games: {error?.message || 'Please try again later.'}</p>
              <Button variant="outline" className="mt-2" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : data?.games?.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <GamepadIcon className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No games found</p>
              <Button onClick={openCreateDialog}>Add your first game</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Game</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Developer</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.games?.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-lg">
                          <AvatarImage src={game.icon} alt={game.name} />
                          <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                            {game.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{game.name}</div>
                          <div className="text-xs text-muted-foreground">
                            /{game.slug}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {game.isFeatured && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {game.isPopular && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-400">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                        {game.isNew && (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-400">
                            <Zap className="h-3 w-3 mr-1" />
                            New
                          </Badge>
                        )}
                        {!game.isFeatured && !game.isPopular && !game.isNew && (
                          <Badge variant="secondary" className="bg-muted text-muted-foreground">
                            Standard
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {game.developerName || <span className="text-muted-foreground text-sm">Not set</span>}
                    </TableCell>
                    <TableCell>
                      {game.categories && game.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {game.categories.map((category) => (
                            <Badge key={category.id} variant="outline" className="text-xs">
                              {category.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No categories</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(game)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on site
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(game)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {data?.pagination && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {(data.pagination.page - 1) * data.pagination.limit + 1} to {
                  Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)
                } of {data.pagination.total} games
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.pagination.hasPrev}
                  onClick={() => {
                    // Handle previous page
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.pagination.hasNext}
                  onClick={() => {
                    // Handle next page
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Game Dialog */}
      <Dialog open={isGameDialogOpen} onOpenChange={setIsGameDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedGame ? 'Edit Game' : 'Add New Game'}</DialogTitle>
            <DialogDescription>
              {selectedGame 
                ? 'Update game information and settings.' 
                : 'Fill in the details to add a new game.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic">
              <TabsList className="mb-4">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Game Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter game name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">
                      Slug
                      <span className="text-xs text-muted-foreground ml-2">
                        (auto-generated if left blank)
                      </span>
                    </Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="game-name-slug"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="developerName">Developer</Label>
                    <Input
                      id="developerName"
                      name="developerName"
                      value={formData.developerName}
                      onChange={handleInputChange}
                      placeholder="Game developer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publisherName">Publisher</Label>
                    <Input
                      id="publisherName"
                      name="publisherName"
                      value={formData.publisherName}
                      onChange={handleInputChange}
                      placeholder="Game publisher name"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="description" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    placeholder="Brief description (displayed in cards)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Appears on game cards and search results. Keep it concise.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Full game description"
                    className="min-h-32"
                  />
                  <p className="text-xs text-muted-foreground">
                    Detailed description displayed on the games detail page.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="images" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="icon">Game Icon</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <div className="mx-auto w-32 h-32 rounded-lg bg-muted flex items-center justify-center mb-4">
                        {formData.icon ? (
                          <Image 
                            src={formData.icon} 
                            alt="Game icon" 
                            className="h-full w-full object-cover rounded-lg"
                          />
                        ) : (
                          <GamepadIcon className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Icon
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Recommended: 512×512px square image.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="banner">Banner Image</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <div className="mx-auto w-full h-32 rounded-lg bg-muted flex items-center justify-center mb-4">
                        {formData.banner ? (
                          <Image 
                            src={formData.banner} 
                            alt="Game banner" 
                            className="h-full w-full object-cover rounded-lg"
                          />
                        ) : (
                          <Upload className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Banner
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Recommended: 1200×400px image.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bannerTitle">Banner Title</Label>
                  <Input
                    id="bannerTitle"
                    name="bannerTitle"
                    value={formData.bannerTitle || ''}
                    onChange={handleInputChange}
                    placeholder="Banner title (optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bannerSubtitle">Banner Subtitle</Label>
                  <Input
                    id="bannerSubtitle"
                    name="bannerSubtitle"
                    value={formData.bannerSubtitle || ''}
                    onChange={handleInputChange}
                    placeholder="Banner subtitle (optional)"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isFeatured">Featured Game</Label>
                      <p className="text-xs text-muted-foreground">
                        Featured games appear in highlighted sections of the store.
                      </p>
                    </div>
                    <Switch
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => handleSwitchChange('isFeatured', checked)}
                    />
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isPopular">Popular Game</Label>
                      <p className="text-xs text-muted-foreground">
                        Popular games appear in trending sections.
                      </p>
                    </div>
                    <Switch
                      id="isPopular"
                      checked={formData.isPopular}
                      onCheckedChange={(checked) => handleSwitchChange('isPopular', checked)}
                    />
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isNew">New Game</Label>
                      <p className="text-xs text-muted-foreground">
                        New games are labeled as new releases.
                      </p>
                    </div>
                    <Switch
                      id="isNew"
                      checked={formData.isNew}
                      onCheckedChange={(checked) => handleSwitchChange('isNew', checked)}
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
                  <div className="flex gap-2 items-center text-amber-800 dark:text-amber-400">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm font-medium">Categories and Products</p>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                    After creating the game, you can manage categories and products from the game detail page.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsGameDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedGame ? 'Update Game' : 'Create Game'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Game</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this game? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedGame && (
            <div className="flex items-center p-4 bg-muted/30 rounded-md">
              <Avatar className="h-10 w-10 rounded-lg mr-3">
                <AvatarImage src={selectedGame.icon} alt={selectedGame.name} />
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                  {selectedGame.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{selectedGame.name}</p>
                <p className="text-sm text-muted-foreground">/{selectedGame.slug}</p>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteGame}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
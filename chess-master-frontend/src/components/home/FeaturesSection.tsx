import React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Crown, BookOpen, TrendingUp } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
	return (
		<div className='max-w-7xl mx-auto px-5 py-16'>
			<div className='text-center mb-12'>
				<h2 className='text-3xl md:text-4xl font-bold mb-4'>
					Why Choose Chess With Masters?
				</h2>
				<p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
					Experience personalized chess coaching from verified masters
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-16'>
				<Card className='text-center'>
					<CardHeader>
						<Crown className='h-12 w-12 text-primary mx-auto mb-4' />
						<CardTitle>Verified Masters</CardTitle>
						<CardDescription>
							All our masters are verified with official ratings
							and titles
						</CardDescription>
					</CardHeader>
				</Card>

				<Card className='text-center'>
					<CardHeader>
						<BookOpen className='h-12 w-12 text-primary mx-auto mb-4' />
						<CardTitle>Flexible Scheduling</CardTitle>
						<CardDescription>
							Book sessions at times that work for you with our
							easy scheduling system
						</CardDescription>
					</CardHeader>
				</Card>

				<Card className='text-center'>
					<CardHeader>
						<TrendingUp className='h-12 w-12 text-primary mx-auto mb-4' />
						<CardTitle>Improve Your Game</CardTitle>
						<CardDescription>
							Get personalized feedback and strategies to take
							your chess to the next level
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		</div>
	);
};
